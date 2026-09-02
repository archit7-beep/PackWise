"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ComplianceSection from "@/components/ComplianceSection";
import NutritionSection from "@/components/NutritionSection";
import SustainabilitySection from "@/components/SustainabilitySection";
import DisposalSection from "@/components/DisposalSection";
import Footer from "@/components/Footer";
import { EASE } from "@/lib/motion";
import { InspectionResponse } from "@/types/api";
import { api } from "@/lib/api";
import { AnimatePresence } from "framer-motion";

const ExpandableField = ({ label, value }: { label: string, value: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = value.length > 40;

  const words = value.split(" ");

  return (
    <div 
      style={{ fontSize: 13, cursor: isLong ? "pointer" : "default" }} 
      onClick={() => isLong && setExpanded(!expanded)}
    >
      <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}: </span>
      
      {!expanded && isLong ? (
        <span 
          style={{ 
            color: "var(--ink)", 
            fontWeight: 700,
            borderBottom: "1px dashed rgba(var(--ink-rgb), 0.3)",
            transition: "color 0.2s"
          }}
        >
          {value.substring(0, 40) + "..."}
        </span>
      ) : isLong && expanded ? (
        <span style={{ color: "var(--ink)", fontWeight: 700, display: "inline-block" }}>
          {words.map((word, i) => (
            <motion.span
              key={i + word}
              initial={{ opacity: 0, filter: "blur(4px)", x: -4 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
              style={{ display: "inline-block", marginRight: "0.25em" }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      ) : (
        <span style={{ color: "var(--ink)", fontWeight: 700 }}>{value}</span>
      )}
    </div>
  );
};

const DataStream = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const rawData = [
      "INITIATING AI CORE PROTOCOL...",
      "LOADING MODELS: EasyOCR, Llama-3...",
      "CALIBRATING VISION SENSORS...",
      "EXTRACTING BBOX: [120, 450, 80, 20]",
      "CONFIDENCE_SCORE: 0.98",
      "MATCH FOUND: 'MRP Rs 68'",
      "MATCH FOUND: 'Net Qty 1L'",
      "EVALUATING FSSAI REGULATION 2.2.1...",
      "DETECTING ALLERGENS...",
      "CROSS_REF_DB: SUCCESS",
      "GENERATING COMPLIANCE HASH...",
      "EXTRACTING NUTRITIONAL MATRIX...",
      "LOCATING MANUFACTURER DETAILS...",
      "VERIFYING DATE FORMATS: DD/MM/YYYY..."
    ];

    let count = 0;
    const interval = setInterval(() => {
      setLines(prev => {
        const newLines = [...prev, rawData[count % rawData.length]];
        return newLines.slice(-12);
      });
      count++;
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: 380, background: "#0a0a0a", borderRadius: 24, padding: "24px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", boxShadow: "inset 0 0 40px rgba(0,0,0,0.8), 0 20px 40px -10px rgba(255,107,0,0.15)" }}>
      {/* Fade overlay at top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg, #0a0a0a, transparent)", zIndex: 1 }} />
      {/* Scanning laser line overlay */}
      <motion.div
        animate={{ y: [0, 380, 0] }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255, 107, 0, 0.5)", boxShadow: "0 0 20px 5px rgba(255, 107, 0, 0.3)", zIndex: 2 }}
      />
      <div style={{ position: "relative", zIndex: 0 }}>
        {lines.map((line, i) => (
          <motion.div key={i + line} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: "#22c55e", fontFamily: "monospace", fontSize: 13, marginBottom: 10, textShadow: "0 0 5px rgba(34,197,94,0.4)" }}>
            {"> " + line}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const LoadingSequence = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: "📡", text: "Connecting to PackWise AI Core..." },
    { icon: "👁️", text: "Running EasyOCR Vision Pipeline..." },
    { icon: "🧠", text: "Extracting Metrology via LLM..." },
    { icon: "⚖️", text: "Evaluating Deterministic Compliance..." },
    { icon: "✨", text: "Finalizing Inspection Report..." }
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(40px, 6vw, 80px)", alignItems: "center", width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      {/* Left side: Data Stream Terminal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
        <DataStream />
      </motion.div>

      {/* Right side: Steps */}
      <div style={{ textAlign: "left" }}>
        {/* Scanner Bar */}
        <div style={{ position: "relative", height: 3, background: "var(--line)", borderRadius: 4, overflow: "hidden", marginBottom: 32 }}>
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ position: "absolute", top: 0, left: 0, height: "100%", background: "var(--orange)", boxShadow: "0 0 10px var(--orange)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((s, i) => {
            const isActive = i === step;
            const isDone = i < step;
            
            return (
              <motion.div
                key={s.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isActive || isDone ? 1 : 0.4, x: isActive || isDone ? 0 : -10 }}
                transition={{ duration: 0.4 }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 16, 
                  background: isActive ? "var(--card)" : "transparent", 
                  padding: "10px 14px", 
                  borderRadius: 12, 
                  border: isActive ? "1px solid var(--orange)" : "1px solid transparent",
                  boxShadow: isActive ? "0 0 20px rgba(255, 107, 0, 0.1)" : "none"
                }}
              >
                <div style={{ 
                  width: 28, height: 28, borderRadius: 8, 
                  background: isDone ? "#16a34a" : isActive ? "var(--orange)" : "var(--line)", 
                  display: "flex", alignItems: "center", justifyContent: "center", 
                  color: isActive || isDone ? "#fff" : "var(--muted)", fontSize: 13, 
                  transition: "background 0.3s" 
                }}>
                  {isDone ? "✓" : s.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? "var(--ink)" : "var(--muted)", transition: "color 0.3s", letterSpacing: "0.02em" }}>
                  {s.text}
                </span>
                {isActive && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                    style={{ marginLeft: "auto", width: 14, height: 14, border: "2px solid var(--orange)", borderTopColor: "transparent", borderRadius: "50%" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DUMMY_INSPECTION = {
  id: "dummy-123",
  status: "COMPLETED",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  images: [{
    id: "img-1",
    inspection_id: "dummy-123",
    storage_path: "https://placehold.co/400x400/f8f9fa/ff6b00?text=Amul+Taaza",
    side: "front",
    created_at: new Date().toISOString()
  }],
  product_data: {
    category: "food",
    confidence_score: 0.98,
    metrology: {
      brand_name: "Amul",
      generic_name_of_commodity: "Taaza Homogenised Toned Milk",
      mrp: 68,
      net_quantity: "1 L",
      mfg_date: "08/2026",
      best_before: "2 days from packing",
    },
    packaging: {
      fssai_license_number: "10012021000071",
      manufacturer_name_address: "Gujarat Co-operative Milk Marketing Federation Ltd, Anand 388001"
    },
    nutrition: {
      energy_kcal: 58,
      protein_g: 3.2,
      carbohydrate_g: 4.8,
      total_sugars_g: 4.8,
      added_sugars_g: 0,
      total_fat_g: 3.0,
      saturated_fat_g: 2.0,
      trans_fat_g: 0,
      sodium_mg: 50,
      calcium_mg: 150
    },
    sustainability: {
      eco_score: 75,
      packaging_material: "Tetra Pak (Paperboard, Aluminum, Plastic)",
      recyclable: "Partial",
      carbon_footprint: "Low",
      disposal_instructions: "Flatten the carton and dispose of in dry waste / recycling bin."
    }
  },
  ocr_result: {
    id: "ocr-1",
    inspection_id: "dummy-123",
    image_id: "img-1",
    full_text: "Amul Taaza Toned Milk\nPasteurised Homogenised Toned Milk\nNET VOLUME: 1 L\nMRP: Rs. 68.00 (Incl. of all taxes)\nFSSAI Lic. No. 10012021000071\nManufactured by: GCMMF Ltd., Anand 388001",
    regions: [],
    processing_status: "success",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  compliance_result: {
    id: "comp-1",
    inspection_id: "dummy-123",
    status: "compliant",
    score: 95,
    as_on_date: new Date().toISOString(),
    total_penalty_exposure_inr: 0,
    evaluated_rules: 5,
    passed_rules: [
      {
        rule_id: "LMPC-R6-1A-MFR",
        rule_ref: "Rule 6(1)(a)",
        title: "Manufacturer / packer / importer name and address",
        severity: "critical",
        status: "pass",
        message: "A Manufacturer / packer / importer name and address declaration was detected on the label.",
        evidence: ["Found: GCMMF Ltd., Anand", "Confidence: 0.98"],
        source_bbox: null,
        field_confidence: 0.98,
        penalty_exposure: null,
        legal_basis: "Legal Metrology Act, 2009",
        suggested_fix: null
      },
      {
        rule_id: "LMPC-R6-1F-MFGDATE",
        rule_ref: "Rule 6(1)(f)",
        title: "Month and year of manufacture / packing / import",
        severity: "major",
        status: "pass",
        message: "A Month and year of manufacture / packing / import was detected in a recognisable format.",
        evidence: ["Found: 08/2026", "Confidence: 0.99"],
        source_bbox: null,
        field_confidence: 0.99,
        penalty_exposure: null,
        legal_basis: "Legal Metrology Act, 2009",
        suggested_fix: null
      },
      {
        rule_id: "LMPC-R6-NETQTY",
        rule_ref: "Rule 6(1)",
        title: "Net quantity in standard units",
        severity: "critical",
        status: "pass",
        message: "A Net Quantity was declared correctly in standard units.",
        evidence: ["Found: 1 L", "Confidence: 0.99"],
        source_bbox: null,
        field_confidence: 0.99,
        penalty_exposure: null,
        legal_basis: "Legal Metrology Act, 2009",
        suggested_fix: null
      },
      {
        rule_id: "LMPC-R6-1B-GENNAME",
        rule_ref: "Rule 6(1)(b)",
        title: "Common or generic name of commodity",
        severity: "major",
        status: "pass",
        message: "The generic name of the product was successfully identified.",
        evidence: ["Found: Taaza Homogenised Toned Milk", "Confidence: 0.98"],
        source_bbox: null,
        field_confidence: 0.98,
        penalty_exposure: null,
        legal_basis: "Legal Metrology Act, 2009",
        suggested_fix: null
      },
      {
        rule_id: "LMPC-R6-1E-MRP",
        rule_ref: "Rule 6(1)(e)",
        title: "Maximum Retail Price (MRP)",
        severity: "critical",
        status: "pass",
        message: "The MRP is clearly printed including taxes.",
        evidence: ["Found: Rs. 68.00 (Incl. of all taxes)", "Confidence: 1.00"],
        source_bbox: null,
        field_confidence: 1.00,
        penalty_exposure: null,
        legal_basis: "Legal Metrology Act, 2009",
        suggested_fix: null
      },
      {
        rule_id: "LMPC-R6-1G-BESTBEFORE",
        rule_ref: "Rule 6(1)(g)",
        title: "Best before or use by date",
        severity: "major",
        status: "pass",
        message: "A valid best before or expiry date was detected.",
        evidence: ["Found: 2 days from packing", "Confidence: 0.95"],
        source_bbox: null,
        field_confidence: 0.95,
        penalty_exposure: null,
        legal_basis: "Legal Metrology Act, 2009",
        suggested_fix: null
      },
      {
        rule_id: "FSSAI-R2-2-1",
        rule_ref: "FSSAI Reg. 2.2.1",
        title: "FSSAI License Number",
        severity: "critical",
        status: "pass",
        message: "A valid 14-digit FSSAI license number is present.",
        evidence: ["Found: 10012021000071", "Confidence: 0.99"],
        source_bbox: null,
        field_confidence: 0.99,
        penalty_exposure: null,
        legal_basis: "Food Safety and Standards Regulations, 2011",
        suggested_fix: null
      }
    ],
    needs_review: [],
    exempted: [],
    llm_verification_status: "verified",
    llm_verification_message: "The PackWise AI engine has successfully verified all required Legal Metrology and FSSAI declarations. The packaging clearly states the generic name, manufacturer details, and net quantity in standard units (1 L). The FSSAI license number is present and valid. No compliance violations detected in the provided label text.",
    llm_verification_references: ["FSSAI Licensing Regulations", "Legal Metrology (Packaged Commodities) Rules, 2011"],
    evaluated_at: new Date().toISOString()
  }
} as any; // Type assertion since it's mock data

function DashboardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [inspection, setInspection] = useState<InspectionResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      setInspection(DUMMY_INSPECTION);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        const data = await api.getInspection(id);
        
        if (data.status === "COMPLETED") {
           // Fetch OCR + Compliance in PARALLEL to reduce latency
           const [ocrResult, complianceResult] = await Promise.all([
              api.getOCR(id).catch((e) => { console.error("OCR fetch error", e); return null; }),
              api.getCompliance(id).catch((e) => { console.error("Compliance fetch error", e); return null; }),
           ]);
           if (ocrResult) data.ocr_result = ocrResult;
           if (complianceResult) data.compliance_result = complianceResult;
        }
        
        if (isMounted) setInspection(data);

        if (isMounted && (data.status === "CREATED" || data.status === "PROCESSING")) {
          timeoutId = setTimeout(poll, 1000);
        }
      } catch (err) {
        console.error("Failed to fetch inspection", err);
        if (isMounted) timeoutId = setTimeout(poll, 1000); // retry
      }
    };

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [id]);

  // If we have no data yet (or API is fetching)
  if (!inspection) {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <Navbar />
        <main style={{ paddingTop: 100, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "var(--muted)" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
            <p style={{ fontWeight: 600 }}>Loading inspection data...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // FAILED state
  if (inspection.status === "FAILED") {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <Navbar />
        <main style={{ paddingTop: 100, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "var(--muted)", maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: "var(--ink)", fontFamily: "var(--display)", marginBottom: 8 }}>Inspection Failed</h2>
            <p>The inspection pipeline encountered an error and could not complete processing. Please try again.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // PROCESSING state
  if (inspection.status === "PROCESSING" || inspection.status === "CREATED") {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <Navbar />
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px var(--pad) 0" }}>
          <div style={{ width: "100%", maxWidth: "var(--wrap)", marginTop: "2vh" }}>
            <h2 style={{ color: "var(--ink)", fontFamily: "var(--display)", fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 48, letterSpacing: "-0.02em", textAlign: "center" }}>
              Analyzing Label Data
            </h2>
            <LoadingSequence />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // COMPLETED state
  const product = inspection.product_data?.metrology;
  const productName = product?.brand_name || product?.generic_name_of_commodity || "Unknown Product";
  const brand = product?.brand_name || "Unknown Brand";
  const rawMrp = product?.mrp;
  const mrp = rawMrp ? (String(rawMrp).includes('₹') || String(rawMrp).toLowerCase().includes('rs') || String(rawMrp).toLowerCase().includes('mrp') ? rawMrp : `₹${rawMrp}`) : "Unavailable";
  const netQty = product?.net_quantity || "Unavailable";
  const mfd = product?.mfg_date || product?.packing_date || product?.import_date || "Unavailable";
  const bestBefore = product?.best_before || product?.expiry_date || "Unavailable";
  const fssai = inspection.product_data?.packaging?.fssai_license_number || "Unavailable";
  const complianceScore = inspection.compliance_result?.score ?? 0;
  const nlpScore = inspection.product_data?.confidence_score ? Math.round(inspection.product_data.confidence_score * 100) : 0;
  const score = Math.round((complianceScore + nlpScore) / 2);

  const isOcrEmpty = !inspection.ocr_result?.full_text || inspection.ocr_result.full_text.trim().length === 0;
  const isInvalidImage = isOcrEmpty || (productName === "Unknown Product" && mrp === "Unavailable" && netQty === "Unavailable" && fssai === "Unavailable");

  if (isInvalidImage) {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <Navbar />
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 var(--pad)", position: "relative", overflow: "hidden" }}>
          {/* Aesthetic background lines and glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: 800, background: "radial-gradient(circle, rgba(255, 37, 0, 0.05) 0%, transparent 50%)", pointerEvents: "none" }} />
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.5, scaleX: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--orange), transparent)", transformOrigin: "center" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
            style={{ textAlign: "center", zIndex: 1, background: "var(--card)", padding: "clamp(40px, 6vw, 60px)", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)", maxWidth: 500, width: "100%" }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255, 37, 0, 0.1)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 20px rgba(255,37,0,0.15)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 36px)", color: "var(--ink)", letterSpacing: "-0.03em", margin: "0 0 12px" }}>
              No Packaging Detected
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15, margin: "0 auto 36px", lineHeight: 1.6 }}>
              We couldn't extract any valid FMCG data, brand names, or nutritional information from this image. Please upload a clear photo of a product label.
            </p>
            <a href="/" className="btn btn--solid btn--lg" style={{ display: "inline-flex" }}>
              <span>Try another image</span>
            </a>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Navbar />

      <main style={{ paddingTop: 100 }}>
        {/* Dashboard header */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            padding: "clamp(40px, 6vh, 80px) var(--pad) clamp(30px, 4vh, 56px)",
            maxWidth: "var(--wrap)",
            marginInline: "auto",
          }}
        >
          
          {/* UNDER CONSTRUCTION DUMMY BANNER */}
          {!id && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.02))",
                border: "1px dashed var(--orange)",
                borderRadius: "var(--r-md)",
                padding: "24px",
                marginBottom: "32px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(255, 107, 0, 0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <h2 style={{ 
                fontFamily: "var(--display)", 
                color: "var(--orange)", 
                fontSize: "clamp(18px, 3vw, 24px)",
                fontWeight: 900,
                letterSpacing: "0.05em",
                margin: "0 0 8px",
                textTransform: "uppercase"
              }}>
                🚧 DUMMY EXAMPLE DATA — UNDER CONSTRUCTION 🚧
              </h2>
              <p style={{ margin: 0, color: "var(--ink)", fontWeight: 500, fontSize: "clamp(13px, 1.5vw, 15px)" }}>
                This is a fully-populated placeholder dashboard to showcase our capabilities for an ideal scan. You reached here because no Scan ID was provided in the URL.
              </p>
            </motion.div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, fontSize: 13, fontFamily: "var(--mono)" }}>
            <a
              href="/"
              style={{ color: "var(--muted)", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Home
            </a>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Dashboard</span>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: "var(--orange)", fontWeight: 600 }}>{productName}</span>
          </div>

          {/* Scan result header card */}
          <div
            className="dashboard-header-grid"
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              padding: "clamp(28px, 3.5vw, 48px)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "clamp(20px, 3vw, 40px)",
              alignItems: "center",
              boxShadow: "var(--shadow)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Background glow */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--orange-rgb),0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            {/* Product icon / Images */}
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #fef9f0, #fdecd0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, border: "1px solid var(--line)", flexShrink: 0, overflow: "hidden" }}>
              {inspection.images.length > 0 ? (() => {
                const imgPath = inspection.images[0].storage_path;
                const imgSrc = imgPath.startsWith("http") ? imgPath : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${imgPath.startsWith("/") ? imgPath.slice(1) : imgPath}`;
                return <img src={imgSrc} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.currentTarget.style.display = "none")} />
              })() : (
                <span>📦</span>
              )}
            </div>

            {/* Product info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{brand}</span>
                {inspection.compliance_result?.status === "compliant" && <span className="badge badge--pass">✓ All Clear</span>}
                {inspection.compliance_result?.status === "non_compliant" && <span className="badge badge--fail">✗ Violations</span>}
              </div>
              <h1 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(22px, 2.5vw, 36px)", letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.1 }}>
                {productName}
              </h1>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "MRP", value: mrp },
                  { label: "Net Qty", value: netQty },
                  { label: "Mfd", value: mfd },
                  { label: "Best Before", value: bestBefore },
                  { label: "FSSAI", value: fssai },
                  { label: "Manufacturer", value: inspection.product_data?.packaging?.manufacturer_name_address || "Unavailable" },
                ].map(({ label, value }) => (
                  <ExpandableField key={label} label={label} value={value} />
                ))}
              </div>
            </div>

            {/* Score ring */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 8px" }}>
                <svg viewBox="0 0 88 88" style={{ width: 88, height: 88, transform: "rotate(-90deg)" }}>
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--line)" strokeWidth="8" />
                  <motion.circle
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke="var(--orange)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - score / 100) }}
                    transition={{ delay: 0.4, duration: 1.2, ease: EASE }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 900, fontSize: 22, color: "var(--ink)" }}>
                  {score}%
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall</p>
            </div>
          </div>

          {/* Quick stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            className="dashboard-stats-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}
          >
            {[
              { icon: "⚖️", label: "Compliance", value: inspection.compliance_result ? `${Array.isArray(inspection.compliance_result.passed_rules) ? inspection.compliance_result.passed_rules.length : 0} PASS` : "Unavailable", color: inspection.compliance_result?.status === "non_compliant" ? "#ef4444" : "#16a34a" },
              { icon: "🧪", label: "OCR Engine", value: inspection.ocr_result ? "Processed" : "Pending", color: "var(--peri-ink)" },
              { icon: "🥗", label: "Nutrition", value: inspection.product_data?.nutrition ? "Parsed" : "Coming Soon", color: inspection.product_data?.nutrition ? "var(--peri-ink)" : "var(--muted)" },
              { icon: "♻️", label: "Sustainability", value: inspection.product_data?.sustainability ? `${inspection.product_data.sustainability.eco_score}/100` : "Coming Soon", color: inspection.product_data?.sustainability ? "#16a34a" : "var(--muted)" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "16px 20px", boxShadow: "var(--shadow-sm)" }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: stat.color, fontFamily: "var(--display)" }}>{stat.value}</p>
              </div>
            ))}
          </motion.div>

        </motion.section>

        {/* Full analysis sections */}
        <div style={{ padding: "0 var(--pad)" }}>
          <ComplianceSection complianceResult={inspection.compliance_result} />
        </div>
        <NutritionSection data={inspection.product_data?.nutrition} />
        <SustainabilitySection data={inspection.product_data?.sustainability} />
        <DisposalSection data={inspection.product_data?.sustainability} />
      </main>

      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
