"""
ocr_service.py — Member 2: Computer Vision + OCR
-------------------------------------------------
Responsibility:
  Accept a list of on-disk image paths, preprocess each one (with auto-deskewing),
  run EasyOCR with multi-orientation detection, and return the aggregated text + regions.

Output contract:
  {
      "full_text": str,
      "regions": [
          {
              "text": str,
              "confidence": float,
              "bbox": [x1, y1, x2, y2]
          },
          ...
      ]
  }
"""

from typing import List, Dict, Any
import cv2
from fastapi.concurrency import run_in_threadpool

from app.core.logging import logger
from app.core.exceptions import PackWiseException
from app.services.image_preprocessor import preprocess_image, rotate_image_fixed


_easyocr_reader = None

def _get_reader():
    """Lazily initialises and returns the EasyOCR Reader singleton."""
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            logger.info("Initialising EasyOCR Reader (first call — loading weights)...")
            _easyocr_reader = easyocr.Reader(
                lang_list=['en'],
                gpu=False,
                verbose=False
            )
            logger.info("EasyOCR Reader ready.")
        except ImportError:
            raise PackWiseException(
                message="EasyOCR is not installed. Run: pip install easyocr",
                code="OCR_DEPENDENCY_ERROR",
                status_code=500
            )
    return _easyocr_reader


def _parse_easyocr_output(raw_results: list, min_confidence: float = 0.5) -> List[Dict[str, Any]]:
    """Converts EasyOCR's raw output into flat OCRRegion dictionaries."""
    regions = []
    for item in raw_results:
        if not item or len(item) < 3:
            continue

        bbox_polygon, text, confidence = item
        if confidence < min_confidence:
            continue

        xs = [int(pt[0]) for pt in bbox_polygon]
        ys = [int(pt[1]) for pt in bbox_polygon]
        bbox = [min(xs), min(ys), max(xs), max(ys)]

        regions.append({
            "text": text.strip(),
            "confidence": round(float(confidence), 4),
            "bbox": bbox
        })
    return regions


class OCRService:
    def _run_ocr_on_image(self, image_path: str, min_confidence: float = 0.5) -> List[Dict[str, Any]]:
        """
        Synchronous OCR execution for a single image with auto-deskewing
        and multi-orientation fallback.
        """
        # 1. Preprocess (EXIF rotation + Auto-deskew + CLAHE contrast)
        try:
            img_array = preprocess_image(image_path, auto_deskew=True)
        except ValueError as e:
            raise PackWiseException(
                message=f"Image preprocessing failed: {e}",
                code="OCR_PREPROCESSING_ERROR",
                status_code=422
            )

        # 2. Run EasyOCR with 90/180/270 rotation detection
        reader = _get_reader()
        try:
            raw_results = reader.readtext(
                img_array, 
                detail=1, 
                paragraph=False,
                rotation_info=[90, 180, 270]
            )
            regions = _parse_easyocr_output(raw_results, min_confidence)

            # 3. Multi-Orientation Auto-Recovery:
            # If standard orientation found very few words, try 90, 180, 270
            if len(regions) < 3:
                best_regions = regions
                best_score = sum(r["confidence"] for r in regions)
                img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

                for deg in [90, 180, 270]:
                    rotated_bgr = rotate_image_fixed(img_bgr, deg)
                    rotated_rgb = cv2.cvtColor(rotated_bgr, cv2.COLOR_BGR2RGB)
                    rot_raw = reader.readtext(rotated_rgb, detail=1, paragraph=False)
                    rot_regions = _parse_easyocr_output(rot_raw, min_confidence)
                    rot_score = sum(r["confidence"] for r in rot_regions)

                    if rot_score > best_score and len(rot_regions) > len(best_regions):
                        best_score = rot_score
                        best_regions = rot_regions

                regions = best_regions

        except Exception as e:
            logger.error(f"EasyOCR inference failed on '{image_path}': {e}")
            raise PackWiseException(
                message="OCR engine failed during inference.",
                code="OCR_INFERENCE_ERROR",
                status_code=500
            )

        logger.info(f"OCR found {len(regions)} regions in '{image_path}'")
        return regions

    async def extract_text_from_images(self, image_paths: List[str]) -> Dict[str, Any]:
        """Public entry point called by pipeline_service."""
        if not image_paths:
            return {"full_text": "", "regions": []}

        all_regions: List[Dict[str, Any]] = []

        for path in image_paths:
            logger.info(f"Running OCR on image: {path}")
            image_regions = await run_in_threadpool(self._run_ocr_on_image, path)
            all_regions.extend(image_regions)

        full_text = "\n".join(r["text"] for r in all_regions)

        return {
            "full_text": full_text,
            "regions": all_regions
        }


ocr_service = OCRService()
