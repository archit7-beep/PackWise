"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function AccuracySection() {
  return (
    <section
      id="accuracy"
      style={{ padding: "clamp(80px, 14vh, 180px) var(--pad)", maxWidth: 1000, marginInline: "auto" }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ fontSize: "clamp(42px, 6vw, 96px)", marginBottom: 0 }}
      >
        Transparent by Design.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          fontSize: "clamp(18px, 2vw, 28px)",
          lineHeight: 1.4,
          letterSpacing: "-0.025em",
          color: "var(--muted)",
          maxWidth: 760,
          margin: "clamp(24px, 4vh, 40px) 0 0",
        }}
      >
        LLMs extract facts. Deterministic rules evaluate compliance.
        Every decision shows the exact regulation checked — not an AI guess.
        We log confidence scores, not blind verdicts.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
        style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 40 }}
      >
        {[
          "Confidence scores on every field",
          "Regulation-backed compliance rules",
          "No raw images stored",
          "Auditable extraction pipeline",
          "FSSAI Act 2006 compliant checks",
          "Open source rule engine",
        ].map((badge) => (
          <span
            key={badge}
            style={{
              padding: "10px 22px",
              borderRadius: 100,
              border: "1px solid var(--line)",
              fontSize: 14,
              fontWeight: 600,
              background: "var(--card)",
              boxShadow: "var(--shadow-sm)",
              color: "var(--ink)",
            }}
          >
            {badge}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
