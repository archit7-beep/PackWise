import sys
import os
import time
from pathlib import Path

# Fix Windows console UTF-8 output if supported
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure the current data/ocr directory is in Python path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from ocr_engine import extract_ocr_data

# Default image fallback if none is provided via command line
DEFAULT_IMAGE = r"C:\Users\Pranav\Downloads\Screenshot 2026-08-30 164320.png"

def main():
    if len(sys.argv) > 1:
        image_path = sys.argv[1].strip('"').strip("'")
    else:
        image_path = DEFAULT_IMAGE

    if not os.path.exists(image_path):
        print(f"[!] Error: Image file not found at:\n   {image_path}")
        return

    print(f"[*] Processing Image with PackWise OCR Engine: {image_path}")
    t0 = time.time()
    result = extract_ocr_data(image_path)
    elapsed = time.time() - t0
    
    if result.get("error"):
        print(f"[!] Processing failed: {result['error']}")
        return

    orientation = result.get("orientation_angle", 0)
    if orientation == 0:
        print("[+] Orientation Check: Image is normally oriented (0 deg)")
    else:
        print(f"[+] Orientation Check: Rotated {orientation} deg to normal upright orientation")

    print(f"[+] Execution Time: {elapsed:.2f} seconds")
    
    print("\n" + "=" * 50)
    print(" FULL TEXT EXTRACTED:")
    print("=" * 50)
    if result.get("full_text", "").strip():
        print(result["full_text"])
    else:
        print("(No text detected with sufficient confidence)")
        
    print("\n" + "=" * 50)
    regions = result.get("regions", [])
    print(f" REGIONS FOUND ({len(regions)}):")
    print("=" * 50)
    for idx, r in enumerate(regions, 1):
        print(f"{idx:2d}. '{r['text']}' (Conf: {r['confidence']:.2f}) | BBox: {r['bbox']}")

if __name__ == "__main__":
    main()
