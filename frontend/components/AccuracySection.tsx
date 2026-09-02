"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const PILLARS = [
  {
    num: "01",
    title: "Deterministic Rule Engine",
    body: "Every compliance verdict traces back to a specific clause. We evaluate against the Legal Metrology (Packaged Commodities) Rules, 2011 and the FSSAI Act, 2006 — not probabilistic guesses.",
    accent: "var(--orange)",
    accentBg: "rgba(255, 37, 0, 0.06)",
    link: {
      label: "LMPC Rules, 2011 →",
      href: "https://wbconsumers.gov.in/writereaddata/ACT%20&%20RULES/Act%20&%20Rules/9%20The%20Legal%20Metrology%20(Package%20Commodities)%20Rules,%202011.pdf",
    },
    tags: ["Rule ID traceability", "Clause-level citations", "Minimal overhead"],
  },
  {
    num: "02",
    title: "Confidence-Scored Extraction",
    body: "Each field extracted from your label — MRP, net quantity, FSSAI license — carries a machine confidence score. Low-confidence fields are automatically flagged for human review instead of being silently accepted.",
    accent: "var(--peri-ink)",
    accentBg: "rgba(76, 99, 199, 0.06)",
    link: {
      label: "FSSAI Licensing & Registration →",
      href: "https://foscos.fssai.gov.in/",
    },
    tags: ["Per-field scoring", "Auto-flagging", "Human-in-the-loop"],
  },
  {
    num: "03",
    title: "Auditable & Ephemeral",
    body: "Raw images are processed in-memory and never persisted. Only the structured JSON extraction and compliance verdict are stored — creating a fully auditable, privacy-respecting pipeline.",
    accent: "#16a34a",
    accentBg: "rgba(22, 163, 74, 0.06)",
    link: {
      label: "FSSAI Act, 2006 — Full Text →",
      href: "https://www.fssai.gov.in/cms/food-safety-and-standards-act-2006.php",
    },
    tags: ["No image storage", "JSON-only audit trail", "GDPR-friendly"],
  },
];

const cardReveal = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.15 + i * 0.12 },
  }),
};

export default function AccuracySection() {
  return (
    <section
      id="accuracy"
      style={{
        padding: "clamp(80px, 14vh, 160px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
      }}
    >
      {/* ── Section Header ── */}
      <div className="accuracy-header-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "end", marginBottom: "clamp(48px, 7vh, 80px)" }}>
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--orange)",
              marginBottom: 16,
            }}
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Transparent<br />by Design.
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
          style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65,
            color: "var(--muted)",
            maxWidth: 380,
            margin: 0,
          }}
        >
          Every decision traces to an exact regulation. We log confidence scores, not blind verdicts — so you can audit every extraction.
        </motion.p>
      </div>

      {/* ── Feature Cards Bento Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "clamp(12px, 1.5vw, 20px)",
        }}
        className="accuracy-grid"
      >
        {PILLARS.map((pillar, i) => {
          let span = "span 12";
          if (i === 0) span = "span 7";
          else if (i === 1) span = "span 5";

          return (
            <motion.div
              key={pillar.num}
              custom={i}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              style={{
                gridColumn: span,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: "clamp(24px, 3vw, 36px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.borderColor = pillar.accent + "50";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--line)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Giant Watermark Number */}
              <div
                style={{
                  position: "absolute",
                  bottom: i === 2 ? -40 : -20,
                  right: i === 2 ? 20 : -10,
                  fontSize: i === 2 ? 180 : 240,
                  fontFamily: "var(--display)",
                  fontWeight: 900,
                  lineHeight: 0.8,
                  color: "var(--ink)",
                  opacity: 0.03,
                  pointerEvents: "none",
                  zIndex: 0,
                  letterSpacing: "-0.05em",
                }}
              >
                {pillar.num}
              </div>

              {/* Accent corner glow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${pillar.accentBg} 0%, transparent 60%)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              {/* Top: Number + Title */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--display)",
                    fontWeight: 900,
                    fontSize: 12,
                    color: pillar.accent,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: 24,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: pillar.accentBg,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: pillar.accent }} />
                  {pillar.num}
                </span>
                
                <h3
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 800,
                    fontSize: "clamp(24px, 2.5vw, 36px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    margin: "0 0 16px",
                    color: "var(--ink)",
                    maxWidth: i === 2 ? "50%" : "100%",
                  }}
                >
                  {pillar.title}
                </h3>
                
                <p
                  style={{
                    fontSize: "clamp(15px, 1.2vw, 17px)",
                    lineHeight: 1.65,
                    color: "var(--muted)",
                    margin: 0,
                    maxWidth: i === 2 ? 600 : "95%",
                  }}
                >
                  {pillar.body}
                </p>
              </div>

              {/* Bottom: Tags + Link */}
              <div style={{ 
                position: "relative", 
                zIndex: 1, 
                marginTop: 40,
                display: "flex",
                flexDirection: i === 2 ? "row" : "column",
                justifyContent: i === 2 ? "space-between" : "flex-start",
                alignItems: i === 2 ? "flex-end" : "flex-start",
                gap: 20
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: "var(--bg)",
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        border: "1px solid var(--line)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={pillar.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    color: pillar.accent,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    paddingBottom: 4,
                    borderBottom: `2px solid ${pillar.accent}40`,
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = pillar.accent}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = `${pillar.accent}40`}
                >
                  {pillar.link.label}
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom stat strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
        style={{
          marginTop: 16,
          padding: "clamp(24px, 3vw, 36px) clamp(28px, 3vw, 48px)",
          background: "var(--ink)",
          borderRadius: "var(--r)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        {[
          { stat: "18", unit: "Rules", desc: "Active compliance checks" },
          { stat: "100%", unit: "", desc: "Deterministic — zero LLM drift" },
          { stat: "0", unit: "Images", desc: "Stored after processing" },
          { stat: "§ 36", unit: "", desc: "LM Act penalties enforced" },
        ].map(({ stat, unit, desc }) => (
          <div key={desc} style={{ textAlign: "center", flex: "1 1 120px" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: "clamp(26px, 2.5vw, 38px)", color: "var(--bg)", letterSpacing: "-0.03em" }}>
              {stat}
              {unit && <span style={{ fontSize: "0.5em", fontWeight: 600, opacity: 0.5, marginLeft: 4 }}>{unit}</span>}
            </div>
            <div style={{ fontSize: 12, color: "rgba(244,242,236,0.45)", fontWeight: 500, marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
