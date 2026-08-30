"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";

interface AlertItem {
  id: string;
  severity: "warning" | "compliant" | "violation";
  category: string;
  code: string;
  title: string;
  desc: string;
  product: {
    icon: string;
    name: string;
    tag: string;
    time: string;
  };
  telemetry: {
    label: string;
    primaryValue: string;
    secondaryValue?: string;
    accentColor: string;
    badgeText: string;
  };
  details: string[];
}

const ALERTS: AlertItem[] = [
  {
    id: "alert-1",
    severity: "warning",
    category: "Legal Metrology",
    code: "RULE 6(1)",
    title: "MRP Font Size Deficit",
    desc: "OCR detected text height of 3.2mm on primary display panel. Mandatory minimum required is 4.0mm.",
    product: {
      icon: "🧴",
      name: "Generic Mustard Oil",
      tag: "Batch #MO-8492",
      time: "2m ago",
    },
    telemetry: {
      label: "Optical Height Gauge",
      primaryValue: "3.2 mm",
      secondaryValue: "Min: 4.0 mm (-0.8mm)",
      accentColor: "#f59e0b",
      badgeText: "DELTA -20%",
    },
    details: [
      "Rule 6(1) Packaging Act 2011 violation",
      "Bounding Box Confidence: 98.4%",
      "Remediation: Increase print font size by +1.2pt",
    ],
  },
  {
    id: "alert-2",
    severity: "compliant",
    category: "Integrity Audit",
    code: "FSSAI 2006",
    title: "100% Mandates Passed",
    desc: "Complete label analysis verified. All 6 mandatory statutory declarations passed with zero non-conformances.",
    product: {
      icon: "🥛",
      name: "Amul Buffalo Milk",
      tag: "Live Scan · Verified",
      time: "Just now",
    },
    telemetry: {
      label: "Compliance Matrix",
      primaryValue: "6 / 6",
      secondaryValue: "Integrity Score: 94/100",
      accentColor: "#10b981",
      badgeText: "PERFECT PASS",
    },
    details: [
      "MRP, Net Qty (1L), Dates valid",
      "FSSAI License #10013022000357 active",
      "Disposal: Tetra Pak laminate recyclable",
    ],
  },
  {
    id: "alert-3",
    severity: "violation",
    category: "Licensing Watchdog",
    code: "SEC 31 AUDIT",
    title: "FSSAI License Lapsed",
    desc: "License #10018022000124 expired on 01-06-2026. Sale or distribution of this batch is legally prohibited.",
    product: {
      icon: "💧",
      name: "XYZ Packaged Water",
      tag: "Sample Audit #WA-102",
      time: "5m ago",
    },
    telemetry: {
      label: "Registry Status",
      primaryValue: "EXPIRED",
      secondaryValue: "89 Days Overdue",
      accentColor: "#ef4444",
      badgeText: "CEASE SALE",
    },
    details: [
      "FSS Act 2006 Section 31 non-compliance",
      "Barcode mapped to blacklisted vendor",
      "Auto-flagged for regulatory inspection report",
    ],
  },
];

export default function AlertsSection() {
  const [selectedId, setSelectedId] = useState<string>("alert-2");

  return (
    <section
      id="alerts"
      style={{
        padding: "clamp(80px, 12vh, 160px) var(--pad)",
        maxWidth: "var(--wrap)",
        marginInline: "auto",
        position: "relative",
      }}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 400,
          background: "radial-gradient(circle, rgba(var(--orange-rgb), 0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(48px, 7vh, 80px)" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}
        >
          <span className="eyebrow" style={{ margin: 0 }}>
            Live Intelligence Telemetry
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          style={{ fontSize: "clamp(38px, 5.5vw, 84px)", letterSpacing: "-0.035em" }}
        >
          Instant Alerts. <br />
          <em>Deterministic precision.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          style={{
            color: "var(--muted)",
            maxWidth: 580,
            margin: "20px auto 0",
            fontSize: "clamp(16px, 1.2vw, 19px)",
            lineHeight: 1.6,
          }}
        >
          Every scanned product is stress-tested against statutory rules. Real-time
          verdicts with micro-measurements, license queries, and actionable fixes.
        </motion.p>
      </div>

      {/* 3 Unique Telemetry Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(20px, 2.5vw, 32px)",
          alignItems: "stretch",
        }}
      >
        {ALERTS.map((alert, i) => {
          const isSelected = selectedId === alert.id;
          const isWarning = alert.severity === "warning";
          const isCompliant = alert.severity === "compliant";
          const isViolation = alert.severity === "violation";

          const themeBorder = isCompliant
            ? "rgba(16, 185, 129, 0.3)"
            : isWarning
            ? "rgba(245, 158, 11, 0.3)"
            : "rgba(239, 68, 68, 0.3)";

          const glowBg = isCompliant
            ? "radial-gradient(circle at top right, rgba(16, 185, 129, 0.08) 0%, transparent 60%)"
            : isWarning
            ? "radial-gradient(circle at top right, rgba(245, 158, 11, 0.08) 0%, transparent 60%)"
            : "radial-gradient(circle at top right, rgba(239, 68, 68, 0.08) 0%, transparent 60%)";

          const statusBadgeBg = isCompliant
            ? "rgba(16, 185, 129, 0.12)"
            : isWarning
            ? "rgba(245, 158, 11, 0.12)"
            : "rgba(239, 68, 68, 0.12)";

          const statusTextColor = isCompliant ? "#10b981" : isWarning ? "#f59e0b" : "#ef4444";

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: EASE }}
              whileHover={{ y: -6, transition: { duration: 0.3, ease: EASE } }}
              onClick={() => setSelectedId(alert.id)}
              style={{
                position: "relative",
                background: "var(--card)",
                backgroundImage: glowBg,
                border: `1.5px solid ${isSelected ? themeBorder : "var(--line)"}`,
                borderRadius: "var(--r-lg)",
                padding: "clamp(24px, 3vw, 36px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 24,
                boxShadow: isSelected
                  ? "0 20px 45px -15px rgba(0,0,0,0.12)"
                  : "var(--shadow-sm)",
                cursor: "pointer",
                transition: "border-color 0.3s, box-shadow 0.3s",
                overflow: "hidden",
              }}
            >
              {/* Top Meta Bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  {/* Category Chip */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    <span>{alert.category}</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "var(--bg-2)",
                        color: "var(--ink)",
                        fontFamily: "monospace",
                        fontSize: 10,
                      }}
                    >
                      {alert.code}
                    </span>
                  </div>

                  {/* Pulsing Status Pill */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 12px",
                      borderRadius: 100,
                      background: statusBadgeBg,
                      color: statusTextColor,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: statusTextColor,
                        display: "inline-block",
                        boxShadow: `0 0 8px ${statusTextColor}`,
                      }}
                    />
                    {alert.severity}
                  </div>
                </div>

                {/* Title & Description */}
                <h3
                  style={{
                    fontFamily: "var(--display)",
                    fontWeight: 800,
                    fontSize: "clamp(20px, 1.8vw, 24px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    margin: "0 0 10px",
                    color: "var(--ink)",
                  }}
                >
                  {alert.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "var(--muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {alert.desc}
                </p>
              </div>

              {/* ──────── UNIQUE CUSTOM TELEMETRY WIDGET ──────── */}
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 18,
                  padding: "16px 18px",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Custom Graphic Visual per Severity */}
                {isWarning && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>Font Caliper Gauge</span>
                      <span style={{ color: "#f59e0b" }}>3.2mm / 4.0mm</span>
                    </div>
                    {/* Visual Caliper Track */}
                    <div style={{ position: "relative", height: 10, background: "var(--bg-2)", borderRadius: 100, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: "80%",
                          background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                          borderRadius: 100,
                        }}
                      />
                      {/* Target threshold indicator */}
                      <div
                        style={{
                          position: "absolute",
                          right: "0%",
                          top: 0,
                          bottom: 0,
                          width: 3,
                          background: "#10b981",
                        }}
                        title="Mandatory Limit"
                      />
                    </div>
                  </div>
                )}

                {isCompliant && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>Statutory Verification</span>
                      <span style={{ color: "#10b981" }}>6/6 PASSED ✓</span>
                    </div>
                    {/* Micro-nodes */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
                      {["MRP", "QTY", "MFG", "EXP", "LIC", "VEG"].map((node) => (
                        <div
                          key={node}
                          style={{
                            textAlign: "center",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            padding: "4px 0",
                            borderRadius: 6,
                            fontSize: 9,
                            fontWeight: 800,
                          }}
                        >
                          {node}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isViolation && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                      <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>License Registry</span>
                      <span style={{ color: "#ef4444" }}>LAPSED (+89d)</span>
                    </div>
                    <div
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px dashed rgba(239, 68, 68, 0.3)",
                        padding: "6px 10px",
                        borderRadius: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#ef4444",
                        fontWeight: 700,
                      }}
                    >
                      <span>#10018022000124</span>
                      <span>INACTIVE</span>
                    </div>
                  </div>
                )}

                {/* Primary metric stat row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, display: "block" }}>
                      {alert.telemetry.label}
                    </span>
                    <span style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 800, color: alert.telemetry.accentColor }}>
                      {alert.telemetry.primaryValue}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 100,
                      background: "var(--bg-2)",
                      color: "var(--ink)",
                    }}
                  >
                    {alert.telemetry.badgeText}
                  </span>
                </div>
              </div>

              {/* Bottom Product Context Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  borderTop: "1px solid var(--line)",
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{alert.product.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "var(--ink)", lineHeight: 1.2 }}>
                      {alert.product.name}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>
                      {alert.product.tag}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                  {alert.product.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
