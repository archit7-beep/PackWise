"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.09 },
  }),
};

const COMPLIANCE_FIELDS = [
  { field: "MRP Display", status: "PASS", note: "₹68 displayed in requisite size", rule: "Legal Metrology Rule 6(1)" },
  { field: "Net Quantity", status: "PASS", note: "1 Litre — correct unit & size", rule: "Weights & Measures Act" },
  { field: "Mfg. Date", status: "PASS", note: "28-08-2026 — clearly printed", rule: "FSSAI Reg. 2.2.2" },
  { field: "Best Before", status: "PASS", note: "31-08-2026 — within shelf life", rule: "FSSAI Reg. 2.2.2" },
  { field: "FSSAI License", status: "PASS", note: "10013022000357 — valid", rule: "FSS Act 2006 §31" },
  { field: "Manufacturer Info", status: "PASS", note: "GCMMF Ltd, Anand, Gujarat", rule: "Legal Metrology Rule 6(2)" },
];

export default function ComplianceSection() {
  return (
    <section
      id="compliance"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "stretch",
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        maxWidth: "var(--wrap)",
        margin: "0 auto clamp(30px, 5vh, 60px)",
      }}
      className="split-grid"
    >
      {/* Text column */}
      <div
        style={{
          padding: "clamp(40px, 6vw, 90px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "var(--peri-panel)",
        }}
      >
        <motion.span
          className="eyebrow"
          style={{ color: "var(--peri-ink)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          Compliance
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          style={{ fontSize: "clamp(42px, 5vw, 84px)", marginBottom: 0 }}
        >
          Legal. <br />FSSAI. <br /><em>Verified.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          style={{ color: "var(--muted)", fontSize: "clamp(16px, 1.2vw, 19px)", maxWidth: 460, margin: "26px 0 0" }}
        >
          Deterministic rules — not LLM guesses — evaluate every mandatory
          labelling field. Every PASS or FAIL cites the exact regulation checked.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}
        >
          {[
            { label: "6 / 6 Checks Passed", color: "#16a34a", bg: "rgba(34,197,94,0.1)" },
            { label: "Confidence: 97%", color: "var(--orange)", bg: "rgba(var(--orange-rgb),0.1)" },
          ].map((b) => (
            <div key={b.label} style={{ padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 700, color: b.color, background: b.bg }}>
              {b.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Compliance table */}
      <div style={{ padding: "clamp(28px, 3vw, 44px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
          Buffalo Milk — Amul — Scan Result
        </p>
        {COMPLIANCE_FIELDS.map((item, i) => (
          <motion.div
            key={item.field}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: EASE }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 0",
              borderBottom: i < COMPLIANCE_FIELDS.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{item.field}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{item.note}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--peri-ink)", opacity: 0.8 }}>{item.rule}</p>
            </div>
            <span className={`badge badge--${item.status === "PASS" ? "pass" : "fail"}`}>
              {item.status === "PASS" ? "✓" : "✗"} {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
