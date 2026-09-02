"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function NutritionSection({ data }: { data?: any }) {
  if (!data) return null;

  const nutrients = [
    { label: "Energy", value: `${data.energy_kcal} kcal`, fill: "100%" },
    { label: "Protein", value: `${data.protein_g} g`, fill: "45%" },
    { label: "Carbohydrate", value: `${data.carbohydrate_g} g`, fill: "65%" },
    { label: "Total Sugars", value: `${data.total_sugars_g} g`, fill: "80%" },
    { label: "Added Sugars", value: `${data.added_sugars_g} g`, fill: "0%" },
    { label: "Total Fat", value: `${data.total_fat_g} g`, fill: "30%" },
    { label: "Saturated Fat", value: `${data.saturated_fat_g} g`, fill: "20%" },
    { label: "Sodium", value: `${data.sodium_mg} mg`, fill: "15%" },
    { label: "Calcium", value: `${data.calcium_mg} mg`, fill: "75%" },
  ];

  return (
    <section
      id="nutrition"
      style={{
        padding: "clamp(60px, 10vh, 130px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px, 5vw, 80px)", alignItems: "center" }} className="hero-grid">
        {/* Nutrition card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            <div style={{ padding: "24px 28px", background: "var(--ink)", color: "var(--bg)" }}>
              <h3 style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 22, letterSpacing: "-0.03em", margin: 0, color: "inherit" }}>Nutrition Facts</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.6 }}>Per 100ml / 100g serving</p>
            </div>
            <div style={{ padding: "8px 28px 28px" }}>
              {nutrients.map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < nutrients.length - 1 ? "1px solid var(--line)" : "none" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{item.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{item.value}</span>
                    </div>
                    {/* Visual Bar */}
                    <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: item.fill }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (i * 0.05), duration: 0.6, ease: EASE }}
                        style={{ height: "100%", background: "var(--orange)", borderRadius: 2 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <div>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ color: "var(--orange)" }}
          >
            Nutrition Intelligence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
            style={{ fontSize: "clamp(42px, 5vw, 84px)", color: "var(--ink)", fontFamily: "var(--display)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", margin: "16px 0 0" }}
          >
            Know what&apos;s in<br />what you <em>eat.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
            style={{ color: "var(--muted)", fontSize: "clamp(16px, 1.2vw, 19px)", maxWidth: 460, margin: "26px 0 0", lineHeight: 1.6 }}
          >
            Our intelligent extraction engine instantly parses macronutrients and cross-references them to give you a complete breakdown of the product's health impact.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
