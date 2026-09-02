export type InspectionStatus = "CREATED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ImageResponse {
  id: string;
  storage_path: string;
  side?: string | null;
  created_at: string;
}

export interface OCRRegion {
  text: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface OCRResultResponse {
  id: string;
  image_id?: string | null;
  full_text?: string | null;
  regions?: OCRRegion[] | null;
  processing_status: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceViolationResponse {
  id: string;
  rule_id: string;
  rule_name: string;
  title?: string;
  severity: string;
  message: string;
  field?: string | null;
  detected_value?: string | null;
  expected_requirement?: string | null;
  evidence?: any | null;
}

export interface ComplianceRuleItemResponse {
  rule_id: string;
  rule_name: string;
  title?: string;
  severity: string;
  message: string;
  field?: string | null;
  detected_value?: string | null;
  expected_requirement?: string | null;
}

export interface ComplianceResultResponse {
  id: string;
  status: string;
  score?: number | null;
  as_on_date?: string | null;
  total_penalty_exposure_inr?: number | null;
  evaluated_rules: string[];
  passed_rules: ComplianceRuleItemResponse[];
  violations: ComplianceViolationResponse[];
  needs_review?: ComplianceRuleItemResponse[] | null;
  exempted?: ComplianceRuleItemResponse[] | null;
  evaluated_at: string;
  llm_verification_status?: string | null;
  llm_verification_message?: string | null;
  llm_verification_references?: string[] | null;
}

export interface MetrologyData {
  brand_name?: string | null;
  generic_name_of_commodity?: string | null;
  mrp?: string | null;
  mrp_evidence?: string | null;
  mrp_height_px?: number | null;
  net_quantity?: string | null;
  net_quantity_height_px?: number | null;
  mfg_date?: string | null;
  packing_date?: string | null;
  import_date?: string | null;
  expiry_date?: string | null;
  best_before?: string | null;
  best_before_evidence?: string | null;
  manufacturer_details?: string | null;
  packer_details?: string | null;
  importer_details?: string | null;
  country_of_origin?: string | null;
  consumer_care_contact?: string | null;
}

export interface NutritionData {
  serving_size?: string | null;
  servings_per_pack?: string | null;
  energy_kcal?: number | null;
  protein_g?: number | null;
  carbohydrates_g?: number | null;
  total_sugars_g?: number | null;
  added_sugars_g?: number | null;
  total_fat_g?: number | null;
  saturated_fat_g?: number | null;
  trans_fat_g?: number | null;
  cholesterol_mg?: number | null;
  sodium_mg?: number | null;
  dietary_fibre_g?: number | null;
}

export interface PackagingData {
  fssai_license_number?: string | null;
  manufacturer_name_address?: string | null;
  is_vegetarian?: boolean | null;
  packaging_material_declared?: string | null;
  recycling_code?: string | null;
  disposal_warning?: string | null;
}

export interface ExtractedProductData {
  metrology: MetrologyData;
  nutrition?: NutritionData | null;
  packaging?: PackagingData | null;
  sustainability?: any;
  confidence_score: number;
  raw_ocr_length?: number | null;
  extracted_fields_count?: number | null;
  total_supported_fields?: number | null;
  warnings: string[];
}

export interface InspectionResponse {
  id: string;
  status: InspectionStatus;
  created_at: string;
  updated_at: string;
  images: ImageResponse[];
  product_data?: ExtractedProductData | null;
  ocr_result?: OCRResultResponse | null;
  compliance_result?: ComplianceResultResponse | null;
}
