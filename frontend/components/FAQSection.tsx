"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const FAQS = [
  { q: "Does PackWise connect to any government database?", a: "No — and that's by design. All 18 compliance rules are encoded directly into our engine from the Legal Metrology (Packaged Commodities) Rules, 2011 and FSSAI labelling regulations. We don't rely on any external API or live government feed, so your scans work offline and results are instant." },
  { q: "How accurate is the OCR extraction?", a: "Our pipeline achieves ~97% average field confidence on clearly printed product labels using EasyOCR + Google GenAI. Confidence scores are shown for every extracted field so you always know how reliable the output is." },
  { q: "What happens to the product image after scanning?", a: "Images are analysed immediately upon upload. Only the structured extraction result (JSON) is stored. Raw images are not retained. Your packaging data never leaves the extraction pipeline." },
  { q: "Which products does PackWise support?", a: "Any packaged product with a visible label — food, beverages, cosmetics, pharmaceutical packaging. Designed for FSSAI and Legal Metrology Act requirements in India." },
  { q: "Can I export the compliance report?", a: "This feature is currently in progress and will be available in the next update. You'll be able to export structured compliance reports as PDF with full audit trail integration." },
  { q: "Is the compliance verdict final or an estimate?", a: "PASS/FAIL verdicts are deterministic — based on explicit rules, not LLM inference. Each verdict cites the exact regulation checked (e.g., FSSAI Reg. 2.2.2, Legal Metrology Rule 6(1))." },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      style={{ padding: "clamp(60px, 10vh, 130px) var(--pad)", maxWidth: "var(--wrap)", marginInline: "auto" }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "0.4fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "start" }}
        className="hero-grid"
      >
        <div style={{ position: "sticky", top: 120 }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
            style={{ fontSize: "clamp(40px, 4.5vw, 72px)" }}
          >
            Good questions.
          </motion.h2>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <motion.details
              key={i}
              className="qa"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6, ease: EASE }}
            >
              <summary id={`faq-${i}`}>
                {faq.q}
                <span className="qa-icon">+</span>
              </summary>
              <p>{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}
