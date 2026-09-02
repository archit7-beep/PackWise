"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

const RULES = [
  {
    id: "LMPC-R6-1A",
    ref: "Rule 6(1)(a)",
    act: "Legal Metrology Act, 2009 — §18",
    title: "Manufacturer / Packer Name & Address",
    desc: "Every pre-packaged commodity must declare the full name and address of the manufacturer, packer, or importer.",
    severity: "critical",
    penalty: "₹25,000 – ₹1,00,000",
    field: "manufacturer_name_address",
  },
  {
    id: "LMPC-R6-1B",
    ref: "Rule 6(1)(b)",
    act: "Legal Metrology Act, 2009 — §18",
    title: "Generic Name of Commodity",
    desc: "The common or generic name of the commodity must be printed on the package in a conspicuous manner.",
    severity: "major",
    penalty: "Up to ₹25,000",
    field: "generic_name",
  },
  {
    id: "LMPC-R6-NETQTY",
    ref: "Rule 6(1) r/w Rule 8",
    act: "Legal Metrology Act, 2009",
    title: "Net Quantity in Standard Units",
    desc: "Net quantity must be declared in standard units (g, kg, ml, L, or number). Packaging weight is excluded per Rule 11.",
    severity: "critical",
    penalty: "₹25,000 – ₹1,00,000",
    field: "net_quantity",
  },
  {
    id: "LMPC-R6-1E",
    ref: "Rule 6(1)(e)",
    act: "Legal Metrology Act, 2009",
    title: "MRP Inclusive of All Taxes",
    desc: "Maximum Retail Price must be declared inclusive of all taxes. No retailer shall charge above MRP per Section 18(2).",
    severity: "critical",
    penalty: "₹25,000 – ₹1,00,000",
    field: "mrp",
  },
  {
    id: "LMPC-R6-1F",
    ref: "Rule 6(1)(f)",
    act: "Legal Metrology Act, 2009",
    title: "Month & Year of Manufacture",
    desc: "The month and year of manufacture, packing, or import must appear in MM/YYYY or month-name format.",
    severity: "major",
    penalty: "Up to ₹25,000",
    field: "mfg_date",
  },
  {
    id: "LMPC-R6-1G",
    ref: "Rule 6(1)(g)",
    act: "Legal Metrology Act, 2009",
    title: "Consumer Care Details",
    desc: "Contact details for consumer complaints — a phone number, email, or postal address — must be declared.",
    severity: "minor",
    penalty: "Up to ₹25,000",
    field: "consumer_care",
  },
  {
    id: "FSSAI-LIC",
    ref: "FSS Reg. 2.1.2(4)",
    act: "FSSAI Act, 2006",
    title: "FSSAI License Number",
    desc: "All food products must display a valid 14-digit FSSAI licence number with the FSSAI logo on the label.",
    severity: "critical",
    penalty: "Up to ₹5,00,000",
    field: "fssai_license",
  },
  {
    id: "LMPC-LANG",
    ref: "Rule 6(2)",
    act: "Legal Metrology Act, 2009",
    title: "Declaration Language",
    desc: "Mandatory declarations must appear in Hindi (Devanagari) or English. At least one of these is required by law.",
    severity: "major",
    penalty: "Up to ₹25,000",
    field: "languages",
  },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "CRITICAL", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  major: { label: "MAJOR", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  minor: { label: "MINOR", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
};

export default function ComplianceShowcase() {
  return (
    <section
      id="compliance"
      style={{
        padding: "clamp(80px, 14vh, 160px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "end", marginBottom: "clamp(48px, 7vh, 72px)" }} className="compliance-showcase-header">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.14em",
              color: "var(--orange)", marginBottom: 16,
            }}
          >
            Compliance Engine · {RULES.length} Active Rules
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              fontSize: "clamp(36px, 5vw, 68px)",
              margin: 0, lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Every rule.<br />
            <span style={{ color: "var(--orange)" }}>Every clause.</span>
          </motion.h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
        >
          <p style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65, color: "var(--muted)",
            maxWidth: 420, margin: "0 0 20px",
          }}>
            PackWise encodes the{" "}
            <a href="https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/Legal_Metrology_Packaged_Commodities_Rules_2011.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textDecorationColor: "var(--line)", textUnderlineOffset: 3, transition: "text-decoration-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = "var(--orange)")} onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = "var(--line)")}>
              LMPC Rules, 2011
            </a>{" "}and{" "}
            <a href="https://www.fssai.gov.in/cms/food-safety-and-standards-act-2006.php" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textDecorationColor: "var(--line)", textUnderlineOffset: 3, transition: "text-decoration-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = "var(--orange)")} onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = "var(--line)")}>
              FSSAI Act, 2006
            </a>{" "}
            into deterministic checks. Each rule maps to a specific legal clause with defined penalties.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {Object.values(SEVERITY_CONFIG).map(({ label, color, bg }) => (
              <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: color }} />
                <span style={{ color: "var(--muted)" }}>{label}</span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Rules Bento Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "clamp(12px, 1.5vw, 20px)",
        }}
        className="compliance-rules-grid"
      >
        {RULES.map((rule, i) => {
          const sev = SEVERITY_CONFIG[rule.severity];
          
          // Determine bento layout spans
          let span = "span 6";
          if (i === 0) span = "span 7";
          else if (i === 1) span = "span 5";
          else if (i === 2) span = "span 5";
          else if (i === 3) span = "span 7";
          else if (i >= 4 && i <= 6) span = "span 4";
          else if (i === 7) span = "span 12";

          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: EASE }}
              style={{
                gridColumn: span,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 24,
                padding: "clamp(20px, 2.5vw, 28px)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: i === 7 ? 120 : 180,
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.borderColor = sev.color + "50";
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
                  bottom: -20,
                  right: -10,
                  fontSize: i === 7 ? 160 : 200,
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
                0{i + 1}
              </div>

              {/* Content Container (above watermark) */}
              <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sev.color }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)", opacity: 0.6 }}>
                      {rule.id}
                    </span>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", background: sev.bg, color: sev.color }}>
                    {sev.label}
                  </span>
                </div>

                {/* Main Text */}
                <div style={{ marginBottom: "auto" }}>
                  <h3 style={{
                    fontFamily: "var(--display)", fontWeight: 800,
                    fontSize: i >= 4 && i <= 6 ? 18 : 22,
                    lineHeight: 1.2, letterSpacing: "-0.02em",
                    color: "var(--ink)", margin: "0 0 10px",
                  }}>
                    {rule.title}
                  </h3>
                  {i !== 7 && (
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: 0, maxWidth: "90%" }}>
                      {rule.desc}
                    </p>
                  )}
                </div>

                {/* Footer Row */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-end",
                  marginTop: i === 7 ? 12 : 24 
                }}>
                  <div>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 4 }}>Penalty Tier</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>₹ {rule.penalty}</div>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--muted)", opacity: 0.7, textAlign: "right" }}>
                    {rule.ref}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Bottom CTA strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
        style={{
          marginTop: 12,
          padding: "20px 32px",
          background: "var(--bg-2)",
          borderRadius: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            All rules sourced from gazette-notified legislation. Penalty tiers per{" "}
            <a
              href="https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/Legal_Metrology_Packaged_Commodities_Rules_2011.pdf"
              target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline", textDecorationColor: "var(--line)", textUnderlineOffset: 3, transition: "text-decoration-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = "var(--orange)")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = "var(--line)")}
            >
              Section 36, LM Act 2009
            </a>.
          </span>
        </div>
        <a
          href="/#top"
          className="btn btn--solid"
          style={{ fontSize: 13, padding: "10px 24px" }}
        >
          <span>Scan Now</span>
        </a>
      </motion.div>
    </section>
  );
}
