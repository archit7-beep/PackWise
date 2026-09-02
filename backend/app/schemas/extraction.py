
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Member 2 — OCR Output Contract
# ---------------------------------------------------------------------------

class OCRRegion(BaseModel):
    """
    A single text region detected by the OCR engine.
    Produced by Member 2 (ocr_service) and consumed by:
      - Member 3 (nlp_service) via the aggregated full_text
      - The database (ocr_results.regions JSONB column)
      - Member 4 (compliance) via evidence bounding boxes
    """
    text: str                           # The recognised text string
    confidence: float = Field(ge=0.0, le=1.0)  # OCR confidence [0, 1]
    bbox: list[int] = Field(min_length=4, max_length=4)
    # bbox format: [x1, y1, x2, y2] — top-left to bottom-right pixel coords


class OCRResult(BaseModel):
    """
    Full aggregated OCR output for one inspection (may span multiple images).
    This is the return type of ocr_service.extract_text_from_images().
    """
    full_text: str                      # All regions joined — fed to Member 3 NLP
    regions: list[OCRRegion]            # Individual regions — stored as JSONB



class MetrologyData(BaseModel):
    # 1. Product Identity
    brand_name: str | None = None
    generic_name_of_commodity: str | None = None
    
    # 2. Price and Quantity
    mrp: str | None = None
    mrp_evidence: str | None = None
    mrp_height_px: int | None = None
    net_quantity: str | None = None
    net_quantity_height_px: int | None = None
    
    # 3. Required Dates
    mfg_date: str | None = None
    packing_date: str | None = None
    import_date: str | None = None
    expiry_date: str | None = None
    best_before: str | None = None
    best_before_evidence: str | None = None
    
    # 4. Required Entities
    manufacturer_details: str | None = None
    packer_details: str | None = None
    importer_details: str | None = None
    
    # 5. Other Prescribed Declarations
    country_of_origin: str | None = None
    consumer_care_contact: str | None = None

class NutritionData(BaseModel):
    serving_size: str | None = None
    servings_per_pack: str | None = None
    energy_kcal: float | None = None
    protein_g: float | None = None
    carbohydrates_g: float | None = None
    total_sugars_g: float | None = None
    added_sugars_g: float | None = None
    total_fat_g: float | None = None
    saturated_fat_g: float | None = None
    trans_fat_g: float | None = None
    cholesterol_mg: float | None = None
    sodium_mg: float | None = None
    dietary_fibre_g: float | None = None

class PackagingData(BaseModel):
    fssai_license_number: str | None = None
    is_vegetarian: bool | None = None
    packaging_material_declared: str | None = None
    recycling_code: str | None = None
    disposal_warning: str | None = None

class ExtractedProductData(BaseModel):
    metrology: MetrologyData
    nutrition: NutritionData | None = None
    packaging: PackagingData | None = None
    
    confidence_score: float = 0.0
    raw_ocr_length: int | None = None
    extracted_fields_count: int | None = None
    total_supported_fields: int | None = None
    warnings: list[str] = []
