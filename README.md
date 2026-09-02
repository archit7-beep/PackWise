# PackWise

PackWise analyzes images of packaged food products and extracts labeling information to help evaluate compliance with applicable Indian packaged-food labeling requirements.

By automating package-label analysis, PackWise helps manufacturers, regulatory inspectors, and quality assurance teams quickly identify missing, incorrect, or non-compliant packaging declarations before products reach the market.

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)

---

## 2. Overview

**What is PackWise?**
PackWise is a full-stack inspection pipeline. You upload images of a product's packaging (e.g., front, back, nutrition panel), and the system extracts structured data (MRP, Best Before, FSSAI license, Net Quantity, etc.).

**Who is it for?**
- Regulatory Inspectors auditing products.
- Quality Assurance (QA) teams verifying label compliance.
- Food manufacturers ensuring their packaging meets statutory requirements.

**Why is this useful?**
Manual inspection of dense, curved, or small text on packaging is error-prone and time-consuming. PackWise automates the extraction and validates the data against deterministic regulatory rules instantly.

---

## 3. How PackWise Works

PackWise uses a robust, deterministic-first orchestration pipeline:

```text
Product Image
      ↓
Image Preprocessing
      ↓
OCR Extraction
      ↓
Deterministic NLP Extraction
      ↓
Optional LLM Refinement
      ↓
Deterministic Compliance Engine
      ↓
Optional AI Advisory
      ↓
Frontend Dashboard Result
```

**Important Architectural Principle:**
The LLM (Google Gemini) is an **optional enhancement**, not a critical dependency. The system primarily relies on deterministic rules. If the Gemini API times out, exceeds quota, or fails, **the inspection will still complete successfully** using the deterministic extraction and compliance rules.

---

## 4. Core Features

PackWise officially supports the following capabilities:
- **Product Image Upload:** Accepts JPEG, PNG, and WebP images.
- **Computer Vision & OCR:** Extracts text, handles image orientation, and deskews difficult regions.
- **Product Information Extraction:**
  - MRP (Maximum Retail Price)
  - Net Quantity
  - Manufacturing / Packing Date
  - Best Before / Expiry Date
  - Manufacturer / Packer / Importer Details
  - Consumer Care Information
  - FSSAI License Number
  - Nutrition Information (Energy, Protein, Sugars, Fat, etc.)
  - Packaging Material / Vegetarian Declarations
- **Deterministic Compliance Checks:** Hardcoded regulatory rule engine evaluating the presence and format of mandatory fields.
- **Compliance Scoring:** Resulting in states such as `Passed`, `Violated`, or `Needs Review`.
- **AI Advisory:** Optional Gemini-powered regulatory insights appended to the report.
- **Inspection Database:** PostgreSQL-backed history of all previous product inspections.

---

## 5. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 / React 19 |
| **Backend** | FastAPI |
| **OCR** | EasyOCR / OpenCV (Headless) |
| **NLP** | Python Deterministic Regex Extraction |
| **LLM** | Google Gemini (google-genai) |
| **Database** | PostgreSQL (Supabase) |
| **Validation** | Pydantic |
| **Testing** | Pytest |
| **Frontend Validation** | ESLint / TypeScript |

---

## 6. Architecture

```text
Frontend (Next.js)
   │
   ▼
Backend API (FastAPI)
   │
   ├── Image Processing (OpenCV / Pillow)
   ├── OCR (EasyOCR)
   ├── NLP (Regex / Deterministic)
   ├── Compliance Engine (Deterministic Rules)
   ├── Optional Gemini (LLM Advisory)
   └── Database (PostgreSQL / asyncpg)
```

**Backend Service Responsibilities:**
- **API Router:** Handles uploads, MIME validation, file size limits, and local storage.
- **PipelineService:** Background task orchestrator that coordinates the linear pipeline independently of the HTTP response.
- **OCRService:** Executes the heavy EasyOCR text extraction and bounding box detection.
- **NLPService:** Scans the raw OCR output using deterministic Regex to find expected patterns.
- **LLMVerificationService:** Optionally refines the data and provides AI advisory.
- **ComplianceService:** Applies statutory rules to the extracted data to determine violations.

---

## 7. Deterministic-First Design

PackWise treats **deterministic processing as the source of truth.** 

```text
OCR
 ↓
Deterministic NLP
 ↓
Deterministic Compliance
```

The LLM (Gemini) is only used for *optional refinement and advisory*. 
- **Graceful Degradation:** A Gemini timeout or quota error falls back safely. The inspection does not fail.
- **Data Protection:** Valid deterministic values (e.g., an explicitly matched MRP) are protected and will not be overwritten by empty or hallucinated LLM output.
- **Regulatory Authority:** Regulatory decisions (Passed/Violated) are made by the deterministic engine. They are not delegated to the LLM.

---

## 8. OCR Pipeline

The OCR pipeline (powered by `EasyOCR` and `cv2`) includes:
1. **EXIF Correction:** Auto-corrects mobile phone camera orientation.
2. **Coarse Orientation Normalization:** Evaluates thumbnails to guarantee upright text.
3. **Morphological Deskewing:** Automatically corrects slant angles up to ±45°.
4. **CLAHE Contrast Enhancement:** Improves readability on glossy, faded, or poorly lit packaging.
5. **Targeted Extraction:** Structures the bounding boxes logically (top-to-bottom, left-to-right).

*(Note: Dense package images can increase OCR processing time significantly depending on CPU capabilities.)*

---

## 9. Data Extraction

Information is extracted from the raw OCR text using deterministic Regex rules. The system prioritizes concrete matches and preserves the original OCR text as evidence.

For example, the OCR text:
```text
BEST BEFORE 6 MONTHS FROM MFG
```
Is deterministically extracted as:
```python
best_before = "6 MONTHS FROM MFG"
```
The system explicitly avoids fabricating or guessing relative calendar dates.

---

## 10. FSSAI Detection

FSSAI license numbers are extracted using highly specific regex patterns that look for the 14-digit format starting with `1`, coupled with common prefixes (e.g., `FSSAI Lic. No.`, `fssai`, `Lic No:`). Surrounding context is evaluated to minimize false positives against other numeric strings on the package.

---

## 11. Compliance Engine

The Compliance Engine is the authoritative regulatory evaluation layer. It checks the extracted structured data against predefined rules (such as the presence of MRP, Best Before, and Net Quantity).

**Result States:**
- `Passed`: The requirement was clearly met.
- `Violated`: The requirement is missing or clearly invalid.
- `Needs Review`: The data was partially extracted or requires human verification.

*(Note: OCR/NLP confidence ≠ compliance score. PackWise is an analysis tool and does not provide legal certification.)*

---

## 12. AI Advisory

Following the deterministic compliance evaluation, an optional Gemini advisory layer is invoked.

```text
Deterministic Compliance
        ↓
Optional AI Advisory
```

- The advisory provides plain-language explanations of potential violations.
- It **cannot** automatically override the deterministic compliance state.
- If Gemini is unavailable, the AI Verification Status simply becomes `UNVERIFIED`, but the deterministic results remain fully visible.

---

## 13. Failure Handling

The background pipeline is designed for graceful failure:

```text
Gemini Success
    ↓
Use optional AI result

Gemini Timeout / Quota / Error
    ↓
Use deterministic result
    ↓
AI Advisory = UNVERIFIED
```

OCR inference and database interactions are also wrapped in fallback blocks to ensure the backend process does not crash unexpectedly during bulk operations.

---

## 14. Project Structure

```text
PackWise/
├── frontend/              # Next.js React application
├── backend/               # FastAPI Python application
├── scripts/               # Standalone development/benchmarking scripts
├── docs/                  # Architecture and context documentation
├── README.md              # Project documentation
└── ...
```

---

## 15. Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20.x
- npm
- PostgreSQL (or Supabase)

### Clone the Repository
```bash
git clone <repository-url>
cd PackWise
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables:**
Copy `.env.example` to `.env` and configure your keys.
```bash
cp .env.example .env
```
Required:
- `DATABASE_URL="postgresql+asyncpg://..."`
- `GEMINI_API_KEY=your_key_here`

**Database Migrations:**
```bash
alembic upgrade head
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 16. Running the Project

**Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```
API available at `http://localhost:8000`.

**Start Frontend:**
```bash
cd frontend
npm run dev
```
Dashboard available at `http://localhost:3000`. 

To perform a basic inspection, open the dashboard in your browser and upload package images using the UI.

---

## 17. Testing

**Backend Tests & Linting:**
```bash
cd backend
pytest
ruff check .
```

**Frontend Build:**
```bash
cd frontend
npm run build
```

---

## 18. API

Key endpoints exposed by the FastAPI backend:

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/inspections` | Upload images and trigger the background inspection pipeline. |
| `GET` | `/api/v1/inspections/{inspection_id}` | Retrieve the core inspection details and extracted product data. |
| `GET` | `/api/v1/inspections/{inspection_id}/ocr` | Retrieve the raw OCR regions and full text evidence. |
| `GET` | `/api/v1/inspections/{inspection_id}/compliance` | Retrieve the deterministic compliance results and optional AI advisory. |

---

## 19. Performance

- **Variable Processing Time:** OCR processing time varies significantly based on image resolution, text density, and CPU performance. Dense package images will increase OCR processing time.
- The pipeline architecture processes tasks in the background to avoid blocking HTTP requests.

---

## 20. Limitations

- **OCR Accuracy:** Highly warped, crushed, or extremely curved packaging can reduce OCR accuracy.
- **Regulatory Limitations:** PackWise is an assistance tool. It evaluates strict patterns but is not a substitute for official regulatory or legal review.

---

## 21. Contributing

We welcome contributions!
1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run tests (`pytest`) and verify frontend builds (`npm run build`).
5. Submit a Pull Request.

---

## 22. License

Licensing information is currently not specified.
