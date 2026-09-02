import json
from google import genai
from pydantic import BaseModel
from typing import Optional

# ==========================================
# STEP 1: Define Your Data Blueprint
# ==========================================
# Each variable is a field you expect from the package.
# Optional[...] means: "If this field is missing on the packet, return null instead of crashing."
class MetrologyData(BaseModel):
    # 1. Product Identity
    brand_name: Optional[str]
    generic_name_of_commodity: Optional[str]
    
    # 2. Price and Quantity (with Pranav's CV font height hooks)
    mrp: Optional[float]
    mrp_height_px: Optional[int]
    net_quantity: Optional[str]
    net_quantity_height_px: Optional[int]
    
    # 3. Required Dates
    mfg_date: Optional[str]
    packing_date: Optional[str]
    import_date: Optional[str]
    expiry_date: Optional[str]
    
    # 4. Required Entities
    manufacturer_details: Optional[str]
    packer_details: Optional[str]
    importer_details: Optional[str]
    
    # 5. Other Prescribed Declarations
    country_of_origin: Optional[str]
    consumer_care_contact: Optional[str]


# ==========================================
# STEP 2: Initialize the AI Client
# ==========================================
client = genai.Client(api_key="GEMINI_API_KEY")


# ==========================================
# STEP 3: The Extraction Function
# ==========================================
def extract_metrology_data(raw_ocr_text: str) -> dict: # Takes a raw text string and returns a structured Python dictionary
    prompt = f"""
    You are a Legal Metrology assistant.
    Read this raw OCR text from a product packaging and fill in the requested schema.
    Fix optical typos (like '2O' -> 20.0 or '1OOg' -> '100g').
    If a field is not present on the package, leave it as null.

    OCR Text:
    {raw_ocr_text}
    """

    try:
        # Pass your Pydantic class directly into response_schema
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': MetrologyData
            }
        )

        # Convert JSON string to a standard Python dictionary
        result_dict = json.loads(response.text)

        # Calculate a basic confidence score: count how many fields were filled
        found_fields = 0
        for value in result_dict.values():
            if value is not None:
                found_fields += 1

        # 15 total mandatory fields
        total_fields = len(result_dict)
        result_dict["confidence_score"] = round(found_fields / total_fields, 2)

        return result_dict

    except Exception as e:
        return {
            "error": str(e),
            "confidence_score": 0.0
        }


# ==========================================
# STEP 4: Test Run
# ==========================================
if __name__ == "__main__":
    sample_ocr = """
    B1scuit
    M.R.P: Rs. 2O/-
    Net Wt: 1OO g
    Mfd by: ABC Foods Ltd.
    """

    extracted_output = extract_metrology_data(sample_ocr)
    print(json.dumps(extracted_output, indent=2))
