"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const RAW_OCR = `MRP Rs 68
Net Qty 1L
Mfd: 28/08/2026
Best Before: 31/08/2026
FSSAI Lic No: 10013022000357
Ingredients: Buffalo Milk
Energy 117 kcal
Protein 3.8g  Fat 6.5g
Carbs 4.9g`;

const STRUCTURED = {
  product_name: "Amul Buffalo Milk",
  brand: "Amul",
  mrp: { value: 68, unit: "INR", confidence: 0.98 },
  net_quantity: { value: 1, unit: "L", confidence: 0.97 },
  mfd: { value: "2026-08-28", confidence: 0.96 },
  best_before: { value: "2026-08-31", confidence: 0.96 },
  fssai_license: { value: "10013022000357", confidence: 0.99 },
};

export default function OCRSection() {
  return (
    <section id="ocr" style={{ padding: "clamp(34px, 6vh, 70px) var(--pad)" }}>
      <div
        style={{
          position: "relative",
          maxWidth: "var(--wrap)",
          marginInline: "auto",
          background: "#000",
          color: "#f4f4f6",
          borderRadius: "var(--r-lg)",
          padding: "clamp(44px, 6.5vw, 96px) clamp(40px, 6vw, 90px)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(255,37,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div
          style={{
            position: "relative", zIndex: 1,
            display: "grid", gridTemplateColumns: "1.15fr 0.85fr",
            gap: "clamp(30px, 5vw, 70px)", alignItems: "center",
          }}
          className="ai-grid"
        >
          {/* Left text */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <motion.span
              className="eyebrow eyebrow--c"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              EasyOCR Engine · NLP Extraction
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
              style={{ fontSize: "clamp(36px, 4.6vw, 76px)", color: "#f4f4f6" }}
            >
              Raw label.<br /><em>Structured data</em> in milliseconds.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
              style={{ color: "rgba(244,244,246,0.7)", fontSize: "clamp(16px, 1.2vw, 20px)", margin: "26px 0 0", maxWidth: 480 }}
            >
              EasyOCR reads the image. Google GenAI extracts every field with
              confidence scoring. Only the structured JSON is stored — no raw image data retained.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              style={{ display: "flex", gap: 44, marginTop: 40 }}
            >
              {[{ stat: "97%", label: "Avg. OCR confidence" }, { stat: "<2s", label: "End-to-end extraction" }].map(({ stat, label }) => (
                <div key={label}>
                  <b style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(34px, 4vw, 54px)", color: "var(--orange)", display: "block", letterSpacing: "-0.04em" }}>{stat}</b>
                  <span style={{ color: "rgba(244,244,246,0.5)", fontSize: 14 }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
          >
            <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px -20px rgba(0,0,0,0.8)" }}>
              {/* Terminal header */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>nlp_engine.py — EasyOCR</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: 16, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>RAW OCR</p>
                  <pre style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{RAW_OCR}</pre>
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: "#22c55e", letterSpacing: "0.08em", textTransform: "uppercase" }}>STRUCTURED JSON</p>
                  <pre style={{ margin: 0, fontSize: 11, fontFamily: "monospace", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {Object.entries(STRUCTURED).map(([key, val]) => (
                      <span key={key}>
                        <span style={{ color: "#79c0ff" }}>&quot;{key}&quot;</span>
                        <span style={{ color: "rgba(255,255,255,0.5)" }}>: </span>
                        <span style={{ color: "#a5d6ff" }}>{JSON.stringify(val)}</span>
                        {"\n"}
                      </span>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
