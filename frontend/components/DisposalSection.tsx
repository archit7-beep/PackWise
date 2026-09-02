"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function DisposalSection({ data }: { data?: any }) {
  if (!data) return null;

  return (
    <section
      id="disposal"
      style={{
        padding: "clamp(40px, 6vh, 80px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
        position: "relative"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "clamp(30px, 4vh, 50px)" }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          Disposal & Nearby Locations
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          style={{ fontSize: "clamp(32px, 4vw, 56px)", color: "var(--ink)", fontFamily: "var(--display)", fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          Find out where it goes.
        </motion.h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }}>
        {/* Disposal Instructions Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="disposal-instructions-grid"
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          style={{
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--r-lg)",
            padding: "clamp(28px, 3vw, 44px)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "clamp(24px, 3vw, 40px)",
            alignItems: "center"
          }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--display)", fontSize: 24, fontWeight: 800, color: "#166534", margin: "0 0 8px" }}>How to dispose of this product:</h3>
            <p style={{ margin: 0, fontSize: 16, color: "#15803d", lineHeight: 1.6 }}>{data.disposal_instructions}</p>
          </div>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, boxShadow: "0 8px 24px rgba(34, 197, 94, 0.25)", flexShrink: 0 }}>
            ♻️
          </div>
        </motion.div>

        {/* Dummy Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          className="disposal-map-grid"
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)",
            padding: "clamp(24px, 3vw, 32px)",
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: "clamp(24px, 3vw, 32px)",
            alignItems: "stretch",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: "var(--display)", color: "var(--ink)" }}>Nearest Recycling Centers</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Based on your current location (Dummy Data)</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {[
                { name: "EcoWaste Hub", distance: "1.2 km", status: "Open Now" },
                { name: "GreenCity Recycling", distance: "3.4 km", status: "Closes at 5 PM" },
                { name: "TetraPak Collection Point", distance: "4.1 km", status: "Open 24/7" },
              ].map((loc, i) => (
                <div key={i} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "border-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--orange)"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{loc.name}</h4>
                    <span style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }}></span>
                      {loc.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--peri-ink)", background: "rgba(var(--peri-ink-rgb), 0.1)", padding: "4px 10px", borderRadius: 100 }}>
                    {loc.distance}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ background: "var(--line)", borderRadius: 16, overflow: "hidden", position: "relative", minHeight: 300 }}>
            {/* Dummy Map Visual */}
            <div style={{ position: "absolute", inset: 0, background: "url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=13&size=800x600&maptype=roadmap&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&key=dummy') center/cover no-repeat", opacity: 0.1, filter: "grayscale(100%)" }}></div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: "0 20px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "var(--shadow-lg)" }}>📍</div>
              <span style={{ background: "var(--card)", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700, boxShadow: "var(--shadow)", border: "1px solid var(--orange)", color: "var(--orange)" }}>
                Google Maps asked for our credit card. 😊
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
