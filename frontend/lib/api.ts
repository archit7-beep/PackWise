import { InspectionResponse, OCRResultResponse, ComplianceResultResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
  uploadInspection: async (files: File[]): Promise<{ id: string }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch(`${API_BASE_URL}/api/v1/inspections`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return res.json();
  },

  getInspection: async (id: string): Promise<InspectionResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/inspections/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch inspection: ${errorText}`);
    }
    return res.json();
  },

  getOCR: async (id: string): Promise<OCRResultResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/inspections/${id}/ocr`, { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch OCR: ${errorText}`);
    }
    return res.json();
  },

  getCompliance: async (id: string): Promise<ComplianceResultResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/inspections/${id}/compliance`, { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch compliance: ${errorText}`);
    }
    return res.json();
  },
};
