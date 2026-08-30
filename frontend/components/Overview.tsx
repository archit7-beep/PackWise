"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const pipeline = [
  { icon: "📷", step: "01", label: "Upload Image", desc: "Take or upload a photo of any packaged product" },
  { icon: "🔍", step: "02", label: "EasyOCR Extraction", desc: "EasyOCR reads every label, text region, and barcode" },
  { icon: "🧠", step: "03", label: "NLP Intelligence", desc: "Google GenAI extracts structured fields with confidence scores" },
  { icon: "⚖️", step: "04", label: "Compliance Check", desc: "Deterministic rules evaluate Legal Metrology & FSSAI requirements" },
  { icon: "📊", step: "05", label: "Intelligence Report", desc: "Nutrition, sustainability, and disposal guidance delivered instantly" },
];

export default function Overview() {
  return (
    <section
      id="overview"
      style={{
        padding: "clamp(40px, 6vh, 80px) var(--pad) clamp(50px, 8vh, 100px)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
      }}
    >
      <div style={{ marginBottom: "clamp(36px, 6vh, 80px)" }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          Overview
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.1, duration: 0.8, ease: EASE }}
          style={{ fontSize: "clamp(40px, 6.5vw, 104px)", marginTop: 0 }}
        >
          Scan → Understand →<br /><em>Evaluate → Act.</em>
        </motion.h2>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(30px, 5vw, 80px)", alignItems: "center" }}
        className="hero-grid"
      >
        {/* Pipeline visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            background: "var(--card)",
            borderRadius: "var(--r-lg)",
            border: "1px solid var(--line)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
            padding: "clamp(28px, 3vw, 44px)",
          }}
        >
          {pipeline.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: EASE }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 20,
                paddingBottom: i < pipeline.length - 1 ? 24 : 0,
                marginBottom: i < pipeline.length - 1 ? 24 : 0,
                borderBottom: i < pipeline.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: i === 0 ? "var(--orange)" : "rgba(var(--orange-rgb), 0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                  border: i === 0 ? "none" : "1px solid var(--line)",
                }}>
                  {item.icon}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", letterSpacing: "0.1em" }}>{item.step}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{item.label}</span>
                </div>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Text */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ fontSize: "clamp(17px, 1.4vw, 22px)", margin: "0 0 28px", color: "var(--ink)" }}
          >
            Open PackWise and the analysis is already done. Which fields were extracted,
            what the compliance status is, and whether your product meets FSSAI labelling
            requirements — no manual inspection required.
          </motion.p>
          <motion.ul
            className="ticks"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          >
            <li>Live OCR with bounding-box confidence scores</li>
            <li>Structured JSON extraction via Google GenAI</li>
            <li>Legal Metrology field detection and validation</li>
            <li>FSSAI license and labelling compliance report</li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
