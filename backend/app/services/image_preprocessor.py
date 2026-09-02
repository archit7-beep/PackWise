"""
image_preprocessor.py — Member 2: Computer Vision + OCR
---------------------------------------------------------
Responsibility:
  Convert a raw, arbitrarily rotated, or skewed packaging image into a
  clean, upright, deskewed NumPy array suitable for OCR.

Pipeline:
  1. EXIF Metadata Orientation Correction (Phone cameras)
  2. Format/Color Normalization to standard 3-channel RGB
  3. Automatic Deskewing (Fixes tilted/slanted packaging)
  4. CLAHE Adaptive Contrast Enhancement (Fixes faded/low-light packaging)
"""

import cv2
import numpy as np
from PIL import Image, ImageOps

from app.core.logging import logger


def _apply_exif_rotation(img: Image.Image) -> Image.Image:
    """Corrects EXIF orientation embedded by phone cameras."""
    try:
        img = ImageOps.exif_transpose(img)
    except Exception as e:
        logger.debug(f"EXIF transpose skipped: {e}")
    return img


def _to_rgb(img: Image.Image) -> Image.Image:
    """Ensures 3-channel RGB format for consistency."""
    if img.mode != "RGB":
        img = img.convert("RGB")
    return img


def _deskew_image(img_bgr: np.ndarray, max_angle: float = 45.0) -> np.ndarray:
    """
    Detects the dominant text line slant angle and deskews the image flat.
    Uses morphological dilation to merge text into lines, then computes minAreaRect.
    """
    try:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        
        # Invert and threshold to isolate high-contrast packaging text
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

        # Morphological operation to connect text characters into lines
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (30, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=2)

        # Find text block contours
        contours, _ = cv2.findContours(dilated, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        angles = []
        for c in contours:
            # Filter out tiny noise contours
            if cv2.contourArea(c) < 500:
                continue
            min_rect = cv2.minAreaRect(c)
            angle = min_rect[-1]

            # Normalize OpenCV angle format (-90 to 0 or 0 to 90 depending on CV2 version)
            if angle < -45:
                angle = -(90 + angle)
            elif angle > 45:
                angle = 90 - angle

            if abs(angle) <= max_angle and abs(angle) > 0.5:
                angles.append(angle)

        if not angles:
            return img_bgr

        # Calculate median angle to reject outliers
        median_angle = float(np.median(angles))
        
        if abs(median_angle) < 0.8:
            # Angle is negligible; skip rotation
            return img_bgr

        logger.info(f"Auto-deskewing image by {median_angle:.2f} degrees")
        
        # Rotate image around center with high-quality cubic interpolation
        (h, w) = img_bgr.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
        deskewed = cv2.warpAffine(
            img_bgr, 
            M, 
            (w, h), 
            flags=cv2.INTER_CUBIC, 
            borderMode=cv2.BORDER_REPLICATE
        )
        return deskewed

    except Exception as e:
        logger.debug(f"Deskewing skipped due to error: {e}")
        return img_bgr


def rotate_image_fixed(img_bgr: np.ndarray, degrees: int) -> np.ndarray:
    """Rotates an image by 90, 180, or 270 degrees cleanly."""
    if degrees == 90:
        return cv2.rotate(img_bgr, cv2.ROTATE_90_CLOCKWISE)
    elif degrees == 180:
        return cv2.rotate(img_bgr, cv2.ROTATE_180)
    elif degrees == 270:
        return cv2.rotate(img_bgr, cv2.ROTATE_90_COUNTERCLOCKWISE)
    return img_bgr


def _enhance_contrast(img_bgr: np.ndarray) -> np.ndarray:
    """Applies CLAHE adaptive contrast per BGR channel."""
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    channels = cv2.split(img_bgr)
    enhanced = [clahe.apply(ch) for ch in channels]
    return cv2.merge(enhanced)


def preprocess_image(image_path: str, auto_deskew: bool = True) -> np.ndarray:
    """
    Full robust preprocessing pipeline for packaging images.

    Returns:
        RGB NumPy array ready for OCR.
    """
    logger.debug(f"Preprocessing image: {image_path}")

    try:
        img = Image.open(image_path)
    except Exception as e:
        raise ValueError(f"Cannot open image at path '{image_path}': {e}") from e

    # 1. Correct EXIF phone camera rotation
    img = _apply_exif_rotation(img)

    # 1.5 Resize image to speed up OCR (max 1000px dimension)
    # 1500px was tested but made OCR 3x slower (99s vs 31s). Not worth it.
    img.thumbnail((1000, 1000), Image.Resampling.LANCZOS)

    # 2. Normalize color mode to RGB
    img = _to_rgb(img)

    # Convert to OpenCV BGR
    img_bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # 3. Auto-deskew tilted packaging
    if auto_deskew:
        img_bgr = _deskew_image(img_bgr)

    # 4. Enhance contrast with CLAHE
    img_bgr_enhanced = _enhance_contrast(img_bgr)

    # Convert back to standard RGB for EasyOCR
    img_rgb = cv2.cvtColor(img_bgr_enhanced, cv2.COLOR_BGR2RGB)
    return img_rgb
