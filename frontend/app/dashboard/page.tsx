"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ComplianceSection from "@/components/ComplianceSection";
import OCRSection from "@/components/OCRSection";
import NutritionSection from "@/components/NutritionSection";
import SustainabilitySection from "@/components/SustainabilitySection";
import Footer from "@/components/Footer";
import { EASE } from "@/lib/motion";

const PRODUCT = {
  name: "Amul Buffalo Milk",
  brand: "Amul",
  mrp: "₹68",
  netQty: "1 Litre",
  score: 94,
  mfd: "28-08-2026",
  bestBefore: "31-08-2026",
  fssai: "10013022000357",
};

export default function DashboardPage() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Navbar />

      <main style={{ paddingTop: 100 }}>
        {/* Dashboard header */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{
            padding: "clamp(40px, 6vh, 80px) var(--pad) clamp(30px, 4vh, 56px)",
            maxWidth: "var(--wrap)",
            marginInline: "auto",
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 13, color: "var(--muted)" }}>
            <a
              href="/"
              style={{ color: "var(--muted)", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              Home
            </a>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>Dashboard</span>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: "var(--orange)", fontWeight: 600 }}>{PRODUCT.name}</span>
          </div>

          {/* Scan result header card */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              padding: "clamp(28px, 3.5vw, 48px)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "clamp(20px, 3vw, 40px)",
              alignItems: "center",
              boxShadow: "var(--shadow)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Background glow */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(var(--orange-rgb),0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

            {/* Product icon */}
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #fef9f0, #fdecd0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, border: "1px solid var(--line)", flexShrink: 0 }}>
              🥛
            </div>

            {/* Product info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{PRODUCT.brand}</span>
                <span className="badge badge--pass">✓ All Clear</span>
              </div>
              <h1 style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "clamp(22px, 2.5vw, 36px)", letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.1 }}>
                {PRODUCT.name}
              </h1>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "MRP", value: PRODUCT.mrp },
                  { label: "Net Qty", value: PRODUCT.netQty },
                  { label: "Mfd", value: PRODUCT.mfd },
                  { label: "Best Before", value: PRODUCT.bestBefore },
                  { label: "FSSAI", value: PRODUCT.fssai },
                ].map(({ label, value }) => (
                  <div key={label} style={{ fontSize: 13 }}>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}: </span>
                    <span style={{ color: "var(--ink)", fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score ring */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 8px" }}>
                <svg viewBox="0 0 88 88" style={{ width: 88, height: 88, transform: "rotate(-90deg)" }}>
                  <circle cx="44" cy="44" r="36" fill="none" stroke="var(--line)" strokeWidth="8" />
                  <motion.circle
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke="var(--orange)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - PRODUCT.score / 100) }}
                    transition={{ delay: 0.4, duration: 1.2, ease: EASE }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: 900, fontSize: 22, color: "var(--ink)" }}>
                  {PRODUCT.score}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Score</p>
            </div>
          </div>

          {/* Quick stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}
          >
            {[
              { icon: "⚖️", label: "Compliance", value: "6/6 PASS", color: "#16a34a" },
              { icon: "🧪", label: "OCR Engine", value: "EasyOCR · 97%", color: "var(--peri-ink)" },
              { icon: "🥗", label: "Nutrition", value: "78 / 100", color: "var(--orange)" },
              { icon: "♻️", label: "Sustainability", value: "Recyclable", color: "#16a34a" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r)", padding: "16px 20px", boxShadow: "var(--shadow-sm)" }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: stat.color, fontFamily: "var(--display)" }}>{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Full analysis sections */}
        <div style={{ padding: "0 var(--pad)" }}>
          <ComplianceSection />
        </div>
        <OCRSection />
        <NutritionSection />
        <SustainabilitySection />
      </main>

      <Footer />
    </>
  );
}
