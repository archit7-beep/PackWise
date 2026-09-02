import re

from app.core.logging import logger
from app.schemas.extraction import (
    ExtractedProductData,
    MetrologyData,
    PackagingData,
)


class NLPService:
    """
    Deterministic NLP extraction — NO LLM calls.
    This is the fast, authoritative core of the pipeline.
    """

    # ── MRP ──────────────────────────────────────────────────────────────
    _MRP_PATTERNS = [
        # Standard: "MRP Rs. 10" / "MRP ₹10" / "M.R.P : 199"
        re.compile(r'(?i)(?:MRP|M\.R\.P)\s*[:/\-\.\?;]?\s*(?:Rs\.?|₹)\s*(\d+(?:\.\d{1,2})?)'),
        # MRP on one line, value nearby (with OCR artefacts like ? ; between)
        re.compile(r'(?i)(?:MRP|M\.R\.P)\s*[:/\-\.\?;₹Rs]*\s*(\d+(?:\.\d{1,2})?)'),
    ]

    # ── Best Before / Expiry ─────────────────────────────────────────────
    _BB_PATTERNS = [
        # Relative durations: "6 MONTHS FROM MFG" or OCR noisy "BEFORE6 MONTHS"
        re.compile(r'(?i)(?:best\s*before|expiry\s*date|expiry|use\s*by|bb)\s*[:/\-\.\?;]?\s*(\d+\s*(?:months?|days?|years?)\s*from\s*(?:mfg|manufacture|manufacturing|packaging|pack))'),
        # Bare duration: "6 MONTHS" or "BEFORE6 MONTHS"
        re.compile(r'(?i)(?:best\s*before|expiry\s*date|expiry|use\s*by|bb)\s*[:/\-\.\?;]?\s*(\d+\s*(?:months?|days?|years?))'),
        # Numeric date: "31/12/2026", "31-12-2026", "31.12.2026"
        re.compile(r'(?i)(?:best\s*before|expiry\s*date|expiry|use\s*by|bb)\s*[:/\-\.\?;]?\s*(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})'),
        # Named month date: "02MAR25" "31 AUG 2026" or "AUG 2026"
        re.compile(r'(?i)(?:best\s*before|expiry\s*date|expiry|use\s*by|bb)\s*[:/\-\.\?;]?\s*(\d{1,2}(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4})'),
        re.compile(r'(?i)(?:best\s*before|expiry\s*date|expiry|use\s*by|bb)\s*[:/\-\.\?;]?\s*((?:\d{1,2}\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4})'),
    ]

    # ── FSSAI ────────────────────────────────────────────────────────────
    _FSSAI_PATTERNS = [
        # Standard: "FSSAI Lic. No. 10020210000039" or "LIC NO. 100..."
        re.compile(r'(?i)(?:fssai|f\.s\.s\.a\.i|fssa[il])\s*[:/\-\.\?;]?\s*(\d{14})'),
        re.compile(r'(?i)(?:fssai|f\.s\.s\.a\.i|fssa[il])\s*[^\d]*?(\d{14})'),
        re.compile(r'(?i)(?:lic(?:ense|ence)?\.?\s*(?:n[o0]\.?)?)\s*[:/\-\.\?;]?\s*(\d{14})'),
        re.compile(r'(?i)(?:lic(?:ense|ence)?\.?\s*(?:n[o0]\.?)?)\s*[^\d]*?(\d{14})'),
        # Fallback: ANY 14-digit number starting with 1 (all FSSAI numbers start with 1)
        re.compile(r'\b(1\d{13})\b')
    ]

    # ── Net Quantity ─────────────────────────────────────────────────────
    _NET_QTY_PATTERNS = [
        # Standard: "NET WEIGHT: 22g" or "NET WT. 100 g"
        re.compile(r'(?i)(?:net\s*(?:weight|wt|qty|quantity|content))\s*[:/\-\.\?;]?\s*(\d+(?:\.\d+)?\s*(?:g|gm|gms|kg|ml|l|ltr|litre|litres|pieces?|pcs?|nos?))\b'),
        # With OCR artefacts between label and value
        re.compile(r'(?i)(?:net\s*(?:weight|wt|qty|quantity|content))\s*[^a-zA-Z]*?(\d+(?:\.\d+)?\s*(?:g|gm|gms|kg|ml|l|ltr))\b'),
    ]

    # ── Manufacturer ─────────────────────────────────────────────────────
    _MFR_PATTERNS = [
        re.compile(r'(?i)(?:mfg\.?d?\s*(?:by|at)?|manufactured\s*by|packed\s*by|marketed\s*by|mfr\.?)\s*[:/\-\.\?;]?\s*(.+?)(?:\n|$)'),
    ]

    # ── PKD / MFG Date ───────────────────────────────────────────────────
    _PKD_DATE_PATTERNS = [
        # "PKD. 01JUL25" or "PKD: 01/07/2025"
        re.compile(r'(?i)(?:pkd|pkg\s*d|packing\s*date|packed\s*on)\s*[:/\-\.\?;]?\s*(\d{1,2}(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4})'),
        re.compile(r'(?i)(?:pkd|pkg\s*d|packing\s*date|packed\s*on)\s*[:/\-\.\?;]?\s*(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})'),
        # MFG date
        re.compile(r'(?i)(?:mfg\.?\s*(?:date)?|manufacturing\s*date)\s*[:/\-\.\?;]?\s*(\d{1,2}(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{2,4})'),
        re.compile(r'(?i)(?:mfg\.?\s*(?:date)?|manufacturing\s*date)\s*[:/\-\.\?;]?\s*(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})'),
    ]

    # ── Consumer Care ────────────────────────────────────────────────────
    _CONSUMER_CARE_PATTERN = re.compile(
        r'(?i)consumer\s*care.*?(\+?\d[\d\s\-]{8,})'
    )

    def _search_multiline(self, text: str, patterns: list) -> str | None:
        """Search across the entire text with each pattern until one matches."""
        for pat in patterns:
            m = pat.search(text)
            if m:
                return m.group(1).strip()
        return None

    async def extract_from_ocr(
        self,
        raw_ocr_text: str,
        cv_font_hooks: dict[str, int] | None = None,
    ) -> ExtractedProductData:
        """
        Deterministic regex-based extraction from OCR text.
        """
        logger.info("Running deterministic NLP extraction...")

        # Work with the full text as a single block to handle multi-line patterns
        full = raw_ocr_text

        # ── MRP ──
        mrp = self._search_multiline(full, self._MRP_PATTERNS)
        mrp_evidence = None
        if mrp:
            ev = re.search(r'(?i)(?:mrp|m\.r\.p|maximum\s*retail\s*price).*?(?:\n|$)', full)
            mrp_evidence = ev.group(0).strip() if ev else None

        # ── Best Before / Expiry ──
        best_before = self._search_multiline(full, self._BB_PATTERNS)
        best_before_evidence = None
        if best_before:
            ev = re.search(r'(?i)(?:best\s*before|expiry\s*date|expiry|use\s*by).*?(?:\n|$)', full)
            best_before_evidence = ev.group(0).strip() if ev else None

        # ── FSSAI ──
        fssai = None
        for pat in self._FSSAI_PATTERNS:
            matches = pat.findall(full)
            if matches:
                # If we found matches, prioritize the last one (often the main FSSAI at bottom)
                # or just use the first match of the *most specific* pattern (the first pattern).
                fssai = matches[-1]
                break

        if fssai:
            logger.info(f"Deterministic NLP found FSSAI: {fssai}")

        # ── Net Quantity ──
        net_quantity = self._search_multiline(full, self._NET_QTY_PATTERNS)

        # ── Manufacturer ──
        manufacturer = self._search_multiline(full, self._MFR_PATTERNS)

        # ── Packing Date / Mfg Date ──
        packing_date = self._search_multiline(full, self._PKD_DATE_PATTERNS)

        # ── Consumer Care ──
        consumer_care = None
        cc_match = self._CONSUMER_CARE_PATTERN.search(full)
        if cc_match:
            consumer_care = cc_match.group(1).strip()

        product_name = None

        if not product_name:
            product_name = "Unknown Product"

        # ── Build structured output ──
        metrology = MetrologyData(
            brand_name=product_name,
            generic_name_of_commodity=None,
            mrp=mrp,
            mrp_evidence=mrp_evidence,
            net_quantity=net_quantity,
            best_before=best_before,
            best_before_evidence=best_before_evidence,
            mfg_date=None,
            packing_date=packing_date,
            manufacturer_details=manufacturer,
            consumer_care_contact=consumer_care,
        )

        if cv_font_hooks:
            d = metrology.model_dump()
            d.update(cv_font_hooks)
            metrology = MetrologyData(**d)

        packaging = PackagingData(fssai_license_number=fssai) if fssai else None

        found_fields = sum(1 for v in metrology.model_dump().values() if v is not None)
        total_fields = len(MetrologyData.model_fields)
        confidence = round(found_fields / total_fields, 2) if total_fields > 0 else 0.0

        logger.info(
            f"Deterministic NLP complete. MRP={mrp}, BB={best_before}, "
            f"FSSAI={fssai}, NetQty={net_quantity}, PKD={packing_date}, "
            f"Mfr={manufacturer is not None}, ConsumerCare={consumer_care is not None}"
        )

        return ExtractedProductData(
            metrology=metrology,
            nutrition=None,
            packaging=packaging,
            confidence_score=confidence,
            raw_ocr_length=len(raw_ocr_text),
            extracted_fields_count=found_fields,
            total_supported_fields=total_fields,
        )


nlp_service = NLPService()
