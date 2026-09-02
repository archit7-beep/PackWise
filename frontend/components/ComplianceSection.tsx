"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { ComplianceResultResponse, ComplianceViolationResponse, ComplianceRuleItemResponse } from "@/types/api";

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: i * 0.09 },
  }),
};

interface ComplianceSectionProps {
  complianceResult?: ComplianceResultResponse | null;
}

export default function ComplianceSection({ complianceResult }: ComplianceSectionProps) {
  if (!complianceResult) {
    return (
      <section
        id="compliance"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          maxWidth: "var(--wrap)",
          margin: "0 auto clamp(30px, 5vh, 60px)",
          minHeight: 300,
          textAlign: "center"
        }}
      >
        <div className="spinner" style={{ marginBottom: 24 }}></div>
        <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 12 }}>Evaluating Legal Rules...</h2>
        <p style={{ color: "var(--muted)", maxWidth: 400 }}>
          Checking the extracted product fields against Legal Metrology and FSSAI deterministic rules.
        </p>
      </section>
    );
  }

  const passedRules: ComplianceRuleItemResponse[] = Array.isArray(complianceResult.passed_rules)
    ? complianceResult.passed_rules
    : [];
  const violations: ComplianceViolationResponse[] = complianceResult.violations || [];
  const needsReview: ComplianceRuleItemResponse[] = Array.isArray(complianceResult.needs_review)
    ? complianceResult.needs_review
    : [];

  const passedCount = passedRules.length;
  const violationsCount = violations.length;
  const needsReviewCount = needsReview.length;
  const totalChecked = passedCount + violationsCount + needsReviewCount;
  const isCompliant = complianceResult.status === "compliant";
  const isNeedsReview = complianceResult.status === "needs_review";

  const statusColor = isCompliant ? "#16a34a" : violationsCount > 0 ? "#ef4444" : "#f59e0b";
  const statusIcon = isCompliant ? "✓" : violationsCount > 0 ? "✗" : "⚠";
  const statusText = isCompliant
    ? "FULLY COMPLIANT"
    : violationsCount > 0
    ? "NON-COMPLIANT"
    : "NEEDS REVIEW";

  return (
    <section
      id="compliance"
      style={{
        maxWidth: "var(--wrap)",
        margin: "0 auto clamp(30px, 5vh, 60px)",
      }}
    >
      {/* ─── Deterministic Compliance Result ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {/* Header */}
        <div 
          className="compliance-header-grid"
          style={{
          padding: "clamp(24px, 3vw, 40px)",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Deterministic Compliance
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: "50%",
                background: `${statusColor}18`, color: statusColor,
                fontSize: 18, fontWeight: 900,
              }}>
                {statusIcon}
              </span>
              <h2 style={{
                fontFamily: "var(--display)", fontWeight: 800,
                fontSize: "clamp(20px, 2.5vw, 30px)", margin: 0,
                letterSpacing: "-0.02em", color: statusColor,
              }}>
                {statusText}
              </h2>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted)", maxWidth: 500 }}>
              {isCompliant
                ? "All applicable Legal Metrology compliance rules passed."
                : violationsCount > 0
                ? `${violationsCount} mandatory declaration(s) failed compliance checks.`
                : `${needsReviewCount} field(s) require manual review due to low extraction confidence.`}
            </p>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--display)", fontWeight: 900,
              fontSize: 32, color: statusColor,
            }}>
              {passedCount} / {totalChecked}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Tests Passed
            </div>
          </div>
        </div>

        {/* Rules Checked */}
        <div style={{ padding: "clamp(20px, 2.5vw, 32px)" }}>
          <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
            Rules Checked ({totalChecked})
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* ── Passed Rules ── */}
            {passedRules.map((rule, i) => (
              <motion.div
                key={rule.rule_id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: "var(--r)",
                  background: "rgba(34,197,94,0.04)",
                }}
              >
                <span style={{ color: "#16a34a", fontSize: 16, fontWeight: 900, flexShrink: 0 }}>✓</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{rule.rule_name || rule.title || rule.rule_id}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#16a34a", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", flexShrink: 0 }}>
                  pass
                </span>
              </motion.div>
            ))}

            {/* ── Needs Review ── */}
            {needsReview.map((rule, i) => (
              <motion.div
                key={rule.rule_id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (passedCount + i) * 0.04, duration: 0.4, ease: EASE }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 14px", borderRadius: "var(--r)",
                  background: "rgba(245,158,11,0.04)",
                }}
              >
                <span style={{ color: "#f59e0b", fontSize: 16, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>⚠</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{rule.rule_name || rule.title || rule.rule_id}</span>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{rule.message}</p>
                  {rule.detected_value && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#f59e0b" }}>Detected: {rule.detected_value}</p>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", flexShrink: 0 }}>
                  review
                </span>
              </motion.div>
            ))}

            {/* ── Violations ── */}
            {violations.map((violation, i) => (
              <motion.div
                key={violation.id || violation.rule_id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (passedCount + needsReviewCount + i) * 0.04, duration: 0.4, ease: EASE }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 14px", borderRadius: "var(--r)",
                  background: "rgba(239,68,68,0.04)",
                }}
              >
                <span style={{ color: "#ef4444", fontSize: 16, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✗</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{violation.rule_name || violation.title || violation.rule_id}</span>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{violation.message}</p>
                  {violation.detected_value && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#ef4444" }}>
                      Detected: {violation.detected_value}
                    </p>
                  )}
                  {violation.expected_requirement && (
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--peri-ink)", opacity: 0.8 }}>
                      Basis: {violation.expected_requirement}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", flexShrink: 0 }}>
                  {violation.severity}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Summary badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <span style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#16a34a", background: "rgba(34,197,94,0.1)" }}>
              {passedCount} Passed
            </span>
            {needsReviewCount > 0 && (
              <span style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                {needsReviewCount} Needs Review
              </span>
            )}
            {violationsCount > 0 && (
              <span style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                {violationsCount} Violations
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── AI Advisory (separate section) ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          overflow: "hidden",
          padding: "clamp(20px, 2.5vw, 32px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            AI Advisory
          </span>
          {complianceResult.llm_verification_status && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 100,
              textTransform: "uppercase", letterSpacing: "0.06em",
              color: complianceResult.llm_verification_status.toUpperCase() === "AGREE"
                ? "#16a34a"
                : complianceResult.llm_verification_status.toUpperCase() === "DISAGREE"
                ? "#ef4444"
                : "#f59e0b",
              background: complianceResult.llm_verification_status.toUpperCase() === "AGREE"
                ? "rgba(34,197,94,0.1)"
                : complianceResult.llm_verification_status.toUpperCase() === "DISAGREE"
                ? "rgba(239,68,68,0.1)"
                : "rgba(245,158,11,0.1)",
            }}>
              {complianceResult.llm_verification_status.toUpperCase()}
            </span>
          )}
        </div>

        {complianceResult.llm_verification_message ? (
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--ink)", lineHeight: 1.6 }}>
            {complianceResult.llm_verification_message}
          </p>
        ) : (
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
            Gemini was unavailable or timed out. No AI advisory was generated.
          </p>
        )}

        <p style={{ margin: 0, fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
          The AI advisory does not affect the deterministic compliance result above.
        </p>

        {complianceResult.llm_verification_references && complianceResult.llm_verification_references.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>References:</p>
            {complianceResult.llm_verification_references.map((ref, i) => (
              <a
                key={i}
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block", fontSize: 11, color: "var(--peri-ink)", marginBottom: 2, wordBreak: "break-all" }}
              >
                {ref}
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
