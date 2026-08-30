"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const NUTRITION = [
  { nutrient: "Energy", per100: "117 kcal", daily: "6%", bar: 6 },
  { nutrient: "Protein", per100: "3.8g", daily: "8%", bar: 8 },
  { nutrient: "Total Fat", per100: "6.5g", daily: "9%", bar: 9 },
  { nutrient: "Saturated Fat", per100: "4.1g", daily: "21%", bar: 21 },
  { nutrient: "Carbohydrates", per100: "4.9g", daily: "2%", bar: 2 },
  { nutrient: "Sugars", per100: "4.9g", daily: "—", bar: 0 },
  { nutrient: "Calcium", per100: "120mg", daily: "12%", bar: 12 },
];

export default function NutritionSection() {
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
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.6 }}>Amul Buffalo Milk · Per 100ml serving</p>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <span style={{ background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>🧪 EasyOCR Extracted</span>
                <span style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>✓ Verified</span>
              </div>
            </div>
            <div style={{ padding: "8px 28px 28px" }}>
              {NUTRITION.map((item, i) => (
                <motion.div
                  key={item.nutrient}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < NUTRITION.length - 1 ? "1px solid var(--line)" : "none" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{item.nutrient}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{item.per100}</span>
                    </div>
                    {item.bar > 0 && (
                      <div style={{ height: 4, background: "var(--bg-2)", borderRadius: 100, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(item.bar * 3, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: EASE }}
                          style={{ height: "100%", background: item.bar > 20 ? "var(--orange)" : "var(--peri-ink)", borderRadius: 100 }}
                        />
                      </div>
                    )}
                  </div>
                  {item.daily !== "—" && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.bar > 20 ? "var(--orange)" : "var(--muted)", minWidth: 32, textAlign: "right" }}>
                      {item.daily}
                    </span>
                  )}
                </motion.div>
              ))}
              <p style={{ margin: "16px 0 0", fontSize: 11, color: "var(--muted)" }}>* Percent daily values based on a 2000 kcal diet</p>
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
          >
            Nutrition Intelligence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
            style={{ fontSize: "clamp(42px, 5vw, 84px)" }}
          >
            Know what&apos;s in<br />what you <em>eat.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
            style={{ color: "var(--muted)", fontSize: "clamp(16px, 1.2vw, 19px)", maxWidth: 460, margin: "26px 0 0" }}
          >
            Every nutrient extracted and cross-referenced with ICMR daily intake recommendations.
          </motion.p>
          <motion.ul
            className="ticks"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
            style={{ marginTop: 28 }}
          >
            <li>Macro and micro nutrient extraction via EasyOCR</li>
            <li>ICMR daily value % calculations</li>
            <li>High-sugar / high-fat flagging</li>
            <li>Health score out of 100</li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
