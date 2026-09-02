"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function OCRSection() {
  const rawText = `For Feedback query Write to: cannectim Isweets com Customer Cle 1800 - 313 4353 (10am 6pm Monday to Friday) Customer Care Address: 129, 3rd Floor; Hullmavu, Bannerghatta Road, Bangalore 560076. Karnataka; INDIA
LAL
Proprietary tood (Ready to Eat Namkeen) Intredients; Peanuts (80r31, Edible Vcgctable OIl (Palmolcin), Bengal Gram Flour Besania Nal Caniee Butter Gnce, [odized Haeen chl111; Dry Moneo Powder chi Raeubrtor (1NS 330), uurmerc; Black Kti Dlack Salt Dried Ginger Porider cumIn Ecc Gmnmon; Gnancn Gloyi eaves Asafotndz Garome Gccandch Nunmers Mlersy
AdvIce: Centain Peanuts- Made [ that Processes Peanuts, Mustard; Nuts; Mik Wncat Sesame and Soy: Lnn Earbonal Per 100} Lenni Eomton (e2) [xtlel Aettr (
Kecp Tour @lyClean
KEEP AWAY FROM Direct SuklIght: STORE COOLAND DRY PLACE. ONCE OPENED STORE NR TIght GONTTAlNee`;

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
            display: "grid", gridTemplateColumns: "1fr 1fr",
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
              confidence scoring.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              style={{ display: "flex", gap: 44, marginTop: 40 }}
            >
              {[
                { stat: "86%", label: "Avg. OCR confidence" },
                { stat: "76", label: "Regions Extracted" }
              ].map(({ stat, label }) => (
                <div key={label}>
                  <b style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(34px, 4vw, 54px)", color: "var(--orange)", display: "block", letterSpacing: "-0.04em" }}>{stat}</b>
                  <span style={{ color: "rgba(244,244,246,0.5)", fontSize: 14 }}>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
            style={{ position: "relative", zIndex: 2 }}
          >
            <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>nlp_engine.py — EasyOCR</span>
              </div>
              <div style={{ padding: 20 }}>
                <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>RAW OCR TEXT</p>
                <pre style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 220, overflowY: "auto" }}>
                  {rawText}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
