"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function SustainabilitySection({ data }: { data?: any }) {
  if (!data) return null;

  const metrics = [
    { icon: "🌍", label: "Eco-Score", value: `${data.eco_score}/100`, desc: "Good Environmental Impact" },
    { icon: "📦", label: "Material", value: data.packaging_material.split(" ")[0], desc: data.packaging_material },
    { icon: "♻️", label: "Recyclability", value: data.recyclable, desc: "Can be processed at local facilities" },
    { icon: "👣", label: "Carbon Footprint", value: data.carbon_footprint, desc: "Estimated emissions for production" },
  ];

  return (
    <section
      id="sustainability"
      style={{
        padding: "clamp(60px, 10vh, 130px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
        position: "relative"
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
          Sustainability Profile
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          style={{ fontSize: "clamp(40px, 6vw, 96px)", color: "var(--ink)", fontFamily: "var(--display)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em" }}
        >
          Packaging impact<br /><em>at a glance.</em>
        </motion.h2>
      </div>

      <div>
        <div
          className="sustainability-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r)",
                padding: "clamp(20px, 2.5vw, 32px)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{m.icon}</div>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</p>
              <p style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--display)" }}>{m.value}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{m.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
