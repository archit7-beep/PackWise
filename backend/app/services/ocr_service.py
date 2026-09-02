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

import time
from typing import Any

import cv2
from fastapi.concurrency import run_in_threadpool

from app.core.exceptions import PackWiseException
from app.core.logging import logger
from app.services.image_preprocessor import preprocess_image

_easyocr_reader = None

def _get_reader():
    """Lazily initialises and returns the EasyOCR Reader singleton."""
    global _easyocr_reader
    if _easyocr_reader is None:
        try:
            import easyocr
            import torch
            
            use_gpu = torch.cuda.is_available()
            
            if not use_gpu:
                # CRITICAL FIX for Windows FastAPI ThreadPool contention:
                # Prevents PyTorch OpenMP from thrashing the CPU, but allows 4 threads for fast inference.
                torch.set_num_threads(4)
                torch.set_num_interop_threads(1)
            
            logger.info(f"Initialising EasyOCR Reader (first call — loading weights, GPU: {use_gpu})...")
            _easyocr_reader = easyocr.Reader(
                lang_list=['en'],
                gpu=use_gpu,
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


def _parse_easyocr_output(raw_results: list, min_confidence: float = 0.5) -> list[dict[str, Any]]:
    """Converts EasyOCR's raw output into flat OCRRegion dictionaries."""
    regions = []
    for item in raw_results:
        if not item or len(item) < 2:
            continue

        if len(item) == 3:
            bbox_polygon, text, confidence = item
        else:
            bbox_polygon, text = item
            confidence = 1.0 # Paragraph mode doesn't return confidence

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
    def _run_ocr_on_image(self, image_path: str, min_confidence: float = 0.5) -> list[dict[str, Any]]:
        """
        Synchronous OCR execution for a single image with auto-deskewing
        and multi-orientation fallback.
        """
        # 1. Preprocess (EXIF rotation + Auto-deskew + CLAHE contrast)
        reader = _get_reader()
        try:
            start_pre = time.time()
            img_array = preprocess_image(image_path, auto_deskew=True)
            logger.info(f"[TIMING] preprocess_image took {time.time() - start_pre:.2f} seconds")
            
            start_base = time.time()
            # 2. Extract Base Text Regions
            # Removed min_size limit to allow EasyOCR to read small text natively
            raw_results = reader.readtext(
                img_array, 
                detail=1, 
                paragraph=True
            )
            logger.info(f"[TIMING] base EasyOCR readtext took {time.time() - start_base:.2f} seconds")
            
            start_parse = time.time()
            regions = _parse_easyocr_output(raw_results, min_confidence)
            logger.info(f"[TIMING] parsing output took {time.time() - start_parse:.2f} seconds. Found {len(regions)} regions.")

        # Removed Multi-Orientation Auto-Recovery to avoid 60+ second OCR times

        except Exception as e:
            logger.error(f"EasyOCR inference failed on '{image_path}': {e}")
            raise PackWiseException(
                message="OCR engine failed during inference.",
                code="OCR_INFERENCE_ERROR",
                status_code=500
            )

        # 4. Targeted High-Resolution OCR for Compliance Fields
        target_keywords = ['mrp', 'rs', '₹', 'price', 'best before', 'exp', 'use by', 'mfg', 'pkd', 'bno', 'b.no', 'net weight', 'net qty', 'weight', 'qty', 'fssai', 'lic']
        target_regions = []
        for r in regions:
            text_lower = r["text"].lower()
            if any(k in text_lower for k in target_keywords):
                target_regions.append(r)
                
        if target_regions:
            try:
                import numpy as np
                from PIL import Image

                from app.services.image_preprocessor import (
                    _apply_exif_rotation,
                    _to_rgb,
                )
                
                orig_img = Image.open(image_path)
                orig_img = _apply_exif_rotation(orig_img)
                orig_img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
                orig_img = _to_rgb(orig_img)
                orig_bgr = cv2.cvtColor(np.array(orig_img), cv2.COLOR_RGB2BGR)
                
                scale_x = orig_img.width / img_array.shape[1]
                scale_y = orig_img.height / img_array.shape[0]
                orig_rgb = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2RGB)
                
                # ── Merge overlapping/nearby bounding boxes into consolidated regions ──
                # This reduces EasyOCR calls from ~7-15 down to ~2-3.
                raw_boxes = []
                for tr in target_regions:
                    x1, y1, x2, y2 = tr["bbox"]
                    w = x2 - x1
                    h = y2 - y1
                    # Expanded crop area (scaled to high res)
                    cx1 = max(0, int((x1 - w * 0.5) * scale_x))
                    cy1 = max(0, int((y1 - h * 1.0) * scale_y))
                    cx2 = min(orig_img.width, int((x2 + w * 3.0) * scale_x))
                    cy2 = min(orig_img.height, int((y2 + h * 4.0) * scale_y))
                    if cx2 > cx1 and cy2 > cy1:
                        raw_boxes.append([cx1, cy1, cx2, cy2])
                
                # Merge overlapping boxes greedily
                def merge_boxes(boxes):
                    if not boxes:
                        return []
                    merged = [list(boxes[0])]
                    for b in boxes[1:]:
                        found = False
                        for m in merged:
                            # Check overlap or proximity (within 50px)
                            if (b[0] <= m[2] + 50 and b[2] >= m[0] - 50 and
                                b[1] <= m[3] + 50 and b[3] >= m[1] - 50):
                                m[0] = min(m[0], b[0])
                                m[1] = min(m[1], b[1])
                                m[2] = max(m[2], b[2])
                                m[3] = max(m[3], b[3])
                                found = True
                                break
                        if not found:
                            merged.append(list(b))
                    return merged
                
                consolidated = merge_boxes(raw_boxes)
                # Cap at 2 regions to bound OCR time
                consolidated = consolidated[:2]
                
                logger.info(f"Targeted OCR: merged {len(target_regions)} keyword hits into {len(consolidated)} consolidated crops")
                
                start_targeted = time.time()
                for crop_box in consolidated:
                    cx1, cy1, cx2, cy2 = crop_box
                    crop = orig_rgb[cy1:cy2, cx1:cx2]
                    
                    # Enhance contrast — CLAHE only, NO binary threshold
                    # Binary thresholding destroyed fine text values (digits, ₹ symbols)
                    try:
                        gray_crop = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
                        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
                        enhanced_crop = clahe.apply(gray_crop)
                        final_crop = cv2.cvtColor(enhanced_crop, cv2.COLOR_GRAY2RGB)
                    except Exception:
                        final_crop = crop
                    
                    crop_raw = reader.readtext(final_crop, detail=1, paragraph=False)
                    crop_regions = _parse_easyocr_output(crop_raw, min_confidence)
                    
                    for cr in crop_regions:
                        cx1_c, cy1_c, cx2_c, cy2_c = cr["bbox"]
                        mapped_bbox = [
                            int(cx1 / scale_x + cx1_c / scale_x),
                            int(cy1 / scale_y + cy1_c / scale_y),
                            int(cx1 / scale_x + cx2_c / scale_x),
                            int(cy1 / scale_y + cy2_c / scale_y)
                        ]
                        cr["bbox"] = mapped_bbox
                        cr["text"] = f"[TARGETED CROP] {cr['text']}"
                        regions.append(cr)
                        
            except Exception as e:
                logger.warning(f"Targeted high-res OCR failed (continuing with low-res): {e}")

        logger.info(f"OCR found {len(regions)} regions (including targeted crops) in '{image_path}'")
        return regions

    async def extract_text_from_images(self, image_paths: list[str]) -> dict[str, Any]:
        """Public entry point called by pipeline_service."""
        if not image_paths:
            return {"full_text": "", "regions": []}

        all_regions: list[dict[str, Any]] = []

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
