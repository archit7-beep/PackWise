"""
ocr_engine.py — Member 2: Computer Vision + OCR Subsystem
==========================================================
Robust, high-performance OCR and Computer Vision pipeline for PackWise.

Handles:
  1. Phone camera EXIF orientation correction.
  2. Coarse Orientation Normalization (Checks 0°, 90°, 180°, 270° on fast preview,
     rotates image to normal/upright before full OCR extraction).
  3. Fine Auto-Deskewing (-45° to +45° slant correction via morphology).
  4. CLAHE Adaptive Contrast Enhancement for faded/glossy packaging.
  5. High-speed, single-pass OCR text detection & reading order structuring.

Output Contract:
  {
      "full_text": str,
      "regions": [
          {
              "text": str,
              "confidence": float,
              "bbox": [x1, y1, x2, y2]
          },
          ...
      ],
      "orientation_angle": int
  }
"""

import os
import json
import warnings
from typing import List, Dict, Any, Union, Tuple
import numpy as np
import cv2
from PIL import Image, ImageOps
from pydantic import BaseModel, Field
import easyocr

# Suppress PyTorch dynamic quantization deprecation warnings for cleaner logging
warnings.filterwarnings("ignore", category=UserWarning, module="torch")


# ==========================================================
# STEP 1: Data Contract Schemas
# ==========================================================

class OCRRegion(BaseModel):
    """A single text region detected on the packaging image."""
    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    bbox: List[int] = Field(min_length=4, max_length=4)  # [x1, y1, x2, y2]


class OCRResult(BaseModel):
    """Aggregated OCR output ready for Member 3 NLP consumption."""
    full_text: str
    regions: List[OCRRegion]
    orientation_angle: int = 0


# ==========================================================
# STEP 2: EasyOCR Reader Singleton
# ==========================================================

_reader = None

def get_reader() -> easyocr.Reader:
    """Initializes EasyOCR Reader once to reuse model weights in memory."""
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(
            lang_list=['en'],
            gpu=False,
            verbose=False
        )
    return _reader


# ==========================================================
# STEP 3: Fast Orientation Detection & Normalization
# ==========================================================

def _apply_exif_rotation(img: Image.Image) -> Image.Image:
    """Corrects EXIF orientation embedded by mobile camera sensors."""
    try:
        return ImageOps.exif_transpose(img)
    except Exception:
        return img


def _score_ocr_results(raw_results: list, min_conf: float = 0.25) -> Tuple[float, int]:
    """
    Computes a text readability score and count of high-confidence words
    to determine whether an orientation is upright.
    """
    valid_score = 0.0
    high_conf_words = 0
    for item in raw_results:
        if not item or len(item) < 3:
            continue
        text = str(item[1]).strip()
        conf = float(item[2])
        if conf >= min_conf and len(text) >= 2:
            # Reward longer words with higher confidence
            valid_score += len(text) * conf
            if conf >= 0.4 and len(text) >= 3:
                high_conf_words += 1
    return valid_score, high_conf_words


def detect_and_normalize_orientation(
    img_rgb: np.ndarray, 
    reader: easyocr.Reader,
    max_preview_dim: int = 360
) -> Tuple[np.ndarray, int]:
    """
    Checks if the image is oriented normally (0°).
    If not, evaluates candidate rotations (90°, 180°, 270°) on a fast downsampled
    thumbnail and rotates the original image to normal upright orientation.
    
    Returns:
        (oriented_img_rgb, detected_rotation_angle)
    """
    h, w = img_rgb.shape[:2]
    
    # 1. Create lightweight thumbnail for fast orientation evaluation
    scale = min(1.0, max_preview_dim / max(h, w))
    if scale < 1.0:
        preview = cv2.resize(
            img_rgb, 
            (int(w * scale), int(h * scale)), 
            interpolation=cv2.INTER_AREA
        )
    else:
        preview = img_rgb

    # 2. Fast-path check at 0° (Normal / Upright)
    res_0 = reader.readtext(preview, detail=1, paragraph=False, batch_size=4, low_text=0.4)
    score_0, high_conf_0 = _score_ocr_results(res_0)

    # If 0° is already upright and readable (>=3 solid words or high total score), return immediately
    if high_conf_0 >= 3 and score_0 > 5.0:
        return img_rgb, 0

    # 3. If 0° was uncertain or low confidence, evaluate 90°, 180°, 270°
    candidate_rotations = [
        (90, cv2.ROTATE_90_CLOCKWISE),
        (180, cv2.ROTATE_180),
        (270, cv2.ROTATE_90_COUNTERCLOCKWISE)
    ]

    best_angle = 0
    best_score = score_0

    for deg, rot_code in candidate_rotations:
        rot_preview = cv2.rotate(preview, rot_code)
        rot_res = reader.readtext(rot_preview, detail=1, paragraph=False, batch_size=4, low_text=0.4)
        rot_score, _ = _score_ocr_results(rot_res)
        if rot_score > best_score:
            best_score = rot_score
            best_angle = deg

    # 4. Apply the winning rotation to full resolution image
    if best_angle == 90:
        oriented_img = cv2.rotate(img_rgb, cv2.ROTATE_90_CLOCKWISE)
    elif best_angle == 180:
        oriented_img = cv2.rotate(img_rgb, cv2.ROTATE_180)
    elif best_angle == 270:
        oriented_img = cv2.rotate(img_rgb, cv2.ROTATE_90_COUNTERCLOCKWISE)
    else:
        oriented_img = img_rgb

    return oriented_img, best_angle


# ==========================================================
# STEP 4: Morphological Deskewing & Contrast Enhancement
# ==========================================================

def _deskew_image(img_bgr: np.ndarray, max_angle: float = 45.0) -> np.ndarray:
    """
    Detects dominant text slant angle on upright image and rotates flat (-45° to +45°).
    """
    try:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

        # Morphological dilation along horizontal axis to merge characters into text lines
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (30, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=2)

        contours, _ = cv2.findContours(dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        angles = []
        for c in contours:
            if cv2.contourArea(c) < 400:
                continue
            min_rect = cv2.minAreaRect(c)
            angle = min_rect[-1]

            if angle < -45:
                angle = -(90 + angle)
            elif angle > 45:
                angle = 90 - angle

            if abs(angle) <= max_angle and abs(angle) > 0.5:
                angles.append(angle)

        if not angles:
            return img_bgr

        median_angle = float(np.median(angles))
        if abs(median_angle) < 0.8:
            return img_bgr

        (h, w) = img_bgr.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), median_angle, 1.0)
        return cv2.warpAffine(
            img_bgr, 
            M, 
            (w, h), 
            flags=cv2.INTER_CUBIC, 
            borderMode=cv2.BORDER_REPLICATE
        )
    except Exception:
        return img_bgr


def _enhance_contrast(img_bgr: np.ndarray) -> np.ndarray:
    """Applies CLAHE adaptive contrast enhancement across channels."""
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    channels = cv2.split(img_bgr)
    enhanced = [clahe.apply(ch) for ch in channels]
    return cv2.merge(enhanced)


# ==========================================================
# STEP 5: Main OCR Extraction Pipeline
# ==========================================================

def _parse_raw_results(raw_results: list, min_confidence: float) -> List[Dict[str, Any]]:
    """Converts EasyOCR raw polygon outputs into bounding box dictionaries."""
    regions = []
    for item in raw_results:
        if not item or len(item) < 3:
            continue

        bbox_polygon, text, confidence = item
        text = str(text).strip()
        if not text or confidence < min_confidence:
            continue

        xs = [int(pt[0]) for pt in bbox_polygon]
        ys = [int(pt[1]) for pt in bbox_polygon]
        bbox = [min(xs), min(ys), max(xs), max(ys)]

        regions.append({
            "text": text,
            "confidence": round(float(confidence), 4),
            "bbox": bbox
        })

    # Sort in natural reading order: top-to-bottom (row bins), left-to-right
    regions.sort(key=lambda r: (r["bbox"][1] // 20, r["bbox"][0]))
    return regions


def extract_ocr_data(
    image_paths: Union[str, List[str]], 
    min_confidence: float = 0.35,
    auto_orient: bool = True,
    auto_deskew: bool = True
) -> Dict[str, Any]:
    """
    High-performance OCR text extraction pipeline:
      1. Loads image & fixes EXIF sensor metadata.
      2. Checks if oriented normally; if not, re-orients image to normal (0, 90, 180, 270).
      3. Applies fine morphological auto-deskewing and CLAHE contrast enhancement.
      4. Performs fast single-pass text detection and reading-order structuring.
    """
    if isinstance(image_paths, str):
        image_paths = [image_paths]

    all_regions: List[Dict[str, Any]] = []
    reader = get_reader()
    applied_orientation = 0

    for path in image_paths:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Image not found at path: {path}")

        try:
            # 1. Load image and apply EXIF orientation
            pil_img = Image.open(path)
            pil_img = _apply_exif_rotation(pil_img)
            if pil_img.mode != "RGB":
                pil_img = pil_img.convert("RGB")
            img_rgb = np.array(pil_img)

            # 2. Check and normalize coarse orientation (0°, 90°, 180°, 270°)
            if auto_orient:
                img_rgb, applied_orientation = detect_and_normalize_orientation(img_rgb, reader)

            # 3. Fine auto-deskewing on upright image & contrast enhancement
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
            if auto_deskew:
                img_bgr = _deskew_image(img_bgr)
            img_bgr_enhanced = _enhance_contrast(img_bgr)
            final_rgb = cv2.cvtColor(img_bgr_enhanced, cv2.COLOR_BGR2RGB)

            # 4. Fast, single-pass OCR text detection
            raw_results = reader.readtext(
                final_rgb, 
                detail=1, 
                paragraph=False,
                batch_size=8
            )
            regions = _parse_raw_results(raw_results, min_confidence)
            all_regions.extend(regions)

        except Exception as e:
            return {
                "error": str(e),
                "full_text": "",
                "regions": [],
                "orientation_angle": applied_orientation
            }

    full_text = "\n".join(r["text"] for r in all_regions)

    return {
        "full_text": full_text,
        "regions": all_regions,
        "orientation_angle": applied_orientation
    }


# ==========================================================
# STEP 6: Standalone Test Execution
# ==========================================================

if __name__ == "__main__":
    import sys
    sample_image = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Pranav\Downloads\Screenshot 2026-08-30 164320.png"

    if os.path.exists(sample_image):
        print(f"Running PackWise OCR Engine on: {sample_image}\n")
        output = extract_ocr_data(sample_image)
        print(json.dumps(output, indent=2))
    else:
        print(f"Sample image not found at: {sample_image}")
