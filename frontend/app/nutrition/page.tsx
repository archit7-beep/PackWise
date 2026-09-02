"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NutritionPage() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Navbar />

      <main style={{ paddingTop: "140px" }}>
        {/* ── HERO SECTION ── */}
        <section
          style={{
            padding: "clamp(60px, 10vh, 120px) var(--pad)",
            maxWidth: "var(--wrap)",
            marginInline: "auto",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 100,
                border: "1px solid var(--line)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--orange)",
                marginBottom: 24,
              }}
            >
              FSSAI Nutritional Regulations
            </span>
            <h1
              style={{
                fontFamily: "var(--display)",
                fontWeight: 900,
                fontSize: "clamp(48px, 8vw, 110px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                color: "var(--ink)",
                margin: "0 0 24px",
              }}
            >
              Nutrition <span style={{ color: "var(--muted)", fontWeight: 700 }}>Decoded.</span>
            </h1>
            <p
              style={{
                fontSize: "clamp(16px, 1.4vw, 20px)",
                color: "var(--muted)",
                maxWidth: 640,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Packaged food shouldn't be a mystery. We break down complex nutritional 
              tables into actionable health insights, highlighting exactly what matters 
              to your body.
            </p>
          </motion.div>
        </section>

        {/* ── THE STANDARD NUTRITION TABLE (FSSAI) ── */}
        <section
          style={{
            padding: "clamp(40px, 8vh, 100px) var(--pad)",
            maxWidth: "var(--wrap)",
            marginInline: "auto",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(40px, 5vw, 80px)", alignItems: "start" }} className="accuracy-grid">
            
            {/* Left Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  fontSize: "clamp(32px, 4vw, 48px)",
                  letterSpacing: "-0.03em",
                  color: "var(--ink)",
                  margin: "0 0 16px",
                  lineHeight: 1.1,
                }}
              >
                The Anatomy of a <br/>Nutrition Panel
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                Under FSSAI regulations, every packaged food must declare nutritional 
                information per 100g (or 100ml) and per serve, along with the 
                percentage of Recommended Dietary Allowance (RDA).
              </p>
              
              <div style={{ padding: "20px 24px", background: "var(--card)", borderRadius: 16, border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--orange)" }}>
                  Mandatory Declarations
                </h4>
                <ul className="steps">
                  <li><span>1</span> Energy value (kcal)</li>
                  <li><span>2</span> Protein & Carbohydrates</li>
                  <li><span>3</span> Total Sugars & Added Sugars</li>
                  <li><span>4</span> Total Fat, Saturated & Trans Fats</li>
                  <li><span>5</span> Sodium</li>
                </ul>
              </div>
            </motion.div>

            {/* Right Table Representation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              style={{
                background: "var(--card)",
                borderRadius: 24,
                padding: "clamp(24px, 4vw, 40px)",
                border: "1px solid var(--line)",
                boxShadow: "var(--shadow-lg)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--ink)", paddingBottom: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 900, fontSize: 24, color: "var(--ink)", letterSpacing: "-0.02em" }}>NUTRITION INFORMATION</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Approximate values per 100g</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Energy", val: "384 kcal", rda: "19%", bad: false },
                  { label: "Protein", val: "8.5 g", rda: "14%", bad: false },
                  { label: "Carbohydrate", val: "68 g", rda: "-", bad: false },
                  { label: "Total Sugars", val: "22 g", rda: "-", bad: false },
                  { label: "Added Sugars", val: "21 g", rda: "42%", bad: true },
                  { label: "Total Fat", val: "12 g", rda: "18%", bad: false },
                  { label: "Saturated Fat", val: "8 g", rda: "36%", bad: true },
                  { label: "Trans Fat", val: "0.2 g", rda: "10%", bad: true },
                  { label: "Sodium", val: "850 mg", rda: "42%", bad: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 15, fontWeight: row.bad ? 700 : 500, color: row.bad ? "#ef4444" : "var(--ink)" }}>
                      {row.label}
                      {row.bad && <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 6px", background: "rgba(239,68,68,0.1)", borderRadius: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>High</span>}
                    </div>
                    <div style={{ display: "flex", gap: 24, textAlign: "right" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", width: 70 }}>{row.val}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", width: 40 }}>{row.rda}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                * % RDA is based on a 2000 kcal diet. <br/>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>Highlighted ingredients</span> exceed recommended limits per serving and are harmful for daily consumption.
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── COMING SOON TRACKER ── */}
        <section
          style={{
            padding: "clamp(40px, 8vh, 100px) var(--pad)",
            maxWidth: 1000,
            marginInline: "auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              background: "var(--ink)",
              borderRadius: 32,
              padding: "clamp(40px, 6vw, 80px)",
              color: "var(--bg)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)"
            }}
          >
            {/* Radial glow background */}
            <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(255, 37, 0, 0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
            
            <span style={{ display: "inline-block", padding: "6px 14px", borderRadius: 100, background: "rgba(255, 37, 0, 0.1)", color: "var(--orange)", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
              Coming Soon
            </span>
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.1 }}>
              Scan. Eat. Track.
            </h2>
            <p style={{ fontSize: "clamp(15px, 1.3vw, 18px)", color: "inherit", opacity: 0.6, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.6 }}>
              Soon, you'll be able to snap a picture of any label, and we'll automatically extract and add the macros and hidden sugars directly to your daily nutritional tracker.
            </p>
            
            {/* Mock UI */}
            <div className="nutrition-coming-soon-stats" style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              {[
                { l: "Daily Sugar", v: "42g / 50g", p: "84%", c: "var(--orange)" },
                { l: "Sodium", v: "1200mg / 2000mg", p: "60%", c: "#eab308" },
                { l: "Protein", v: "45g / 60g", p: "75%", c: "#3b82f6" },
              ].map(stat => (
                <div key={stat.l} style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: "16px 20px", borderRadius: 16, width: "180px", textAlign: "left", color: "var(--ink)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{stat.l}</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{stat.v}</div>
                  <div style={{ width: "100%", height: 4, background: "var(--line)", borderRadius: 2 }}>
                    <div style={{ width: stat.p, height: "100%", background: stat.c, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── QUOTE BOX ── */}
        <section
          style={{
            padding: "clamp(40px, 8vh, 100px) var(--pad) clamp(80px, 16vh, 180px)",
            maxWidth: 800,
            marginInline: "auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              padding: "40px",
              border: "1px solid var(--line)",
              borderLeft: "4px solid var(--orange)",
              background: "var(--card)",
              borderRadius: "0 24px 24px 0",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ fontSize: 48, color: "var(--orange)", lineHeight: 0.5, fontFamily: "serif", marginBottom: 20 }}>"</div>
            <h3 style={{
              fontFamily: "var(--display)",
              fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 36px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
              color: "var(--ink)",
              margin: "0 0 24px"
            }}>
              Don't just look at the front of the packet. Turn it around. Label Padhega India.
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--peri-panel)", display: "grid", placeItems: "center", color: "var(--peri-ink)", fontWeight: 800, fontSize: 18 }}>
                AK
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>Anna Kisan</div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Advocating for nutritional transparency</div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>
      
      <Footer />
    </>
  );
}
