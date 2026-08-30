"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function SustainabilitySection() {
  const metrics = [
    { icon: "♻️", label: "Packaging Type", value: "Tetra Pak", sub: "Multi-layer laminate" },
    { icon: "🌱", label: "Recyclability", value: "Recyclable", sub: "Drop at collection centres" },
    { icon: "💨", label: "Carbon Footprint", value: "Low", sub: "~0.9 kg CO₂e/litre" },
    { icon: "🗑️", label: "Disposal", value: "Segregate", sub: "Dry waste bin" },
  ];

  return (
    <section
      id="sustainability"
      style={{
        padding: "clamp(60px, 10vh, 130px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vh, 80px)" }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          Sustainability
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          style={{ fontSize: "clamp(40px, 6vw, 96px)" }}
        >
          Packaging impact<br /><em>at a glance.</em>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          style={{ color: "var(--muted)", maxWidth: 540, margin: "24px auto 0", fontSize: "clamp(16px, 1.2vw, 19px)" }}
        >
          From material classification to nearest recycling facility,
          PackWise tells you exactly how to handle every package responsibly.
        </motion.p>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="card-hover"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: EASE }}
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              padding: "clamp(20px, 2.5vw, 32px)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 16, lineHeight: 1 }}>{m.icon}</div>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 20, fontFamily: "var(--display)", letterSpacing: "-0.02em", color: "var(--ink)" }}>{m.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Disposal guide */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          padding: "clamp(28px, 3vw, 44px)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "clamp(24px, 3vw, 40px)",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ fontFamily: "var(--display)", fontSize: "clamp(22px, 2.5vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Disposal Guide
          </h3>
          <p style={{ color: "var(--muted)", margin: "0 0 20px", fontSize: 15, lineHeight: 1.6 }}>
            Amul Buffalo Milk comes in Tetra Pak packaging. Rinse, flatten, and
            place in the dry waste / recyclables bin. Do not mix with wet waste.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Rinse Empty Pack", "Flatten Before Disposal", "Dry Waste Bin", "Tetra Pak Facility"].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "6px 14px",
                  borderRadius: 100,
                  border: "1px solid var(--line)",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "var(--bg)",
                  color: "var(--ink)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(var(--orange-rgb),0.06) 100%)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 20,
              padding: 24,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                flexShrink: 0,
              }}
            >
              🌍
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>Sustainability Score</p>
              <p style={{ margin: 0, fontFamily: "var(--display)", fontWeight: 900, fontSize: 42, letterSpacing: "-0.04em", color: "#16a34a", lineHeight: 1 }}>
                78<small style={{ fontSize: 20, color: "var(--muted)", fontWeight: 600 }}>/100</small>
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Above average — Recyclable packaging</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
