"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";

const TEAM = [
  { name: "Archit Sali", email: "architsali07@gmail.com", role: "Tech Lead, AI & Backend" },
  { name: "Jatin Watwani", email: "jatin.naresh.watwani@gmail.com", role: "ML/NLP" },
  { name: "Pranav Dongardive", email: "pranavdongardive187@gmail.com", role: "OCR" },
  { name: "Pradnya Narawade", email: "pradnyanardwep@gmail.com", role: "QA & Compliance" },
  { name: "Karunnya Pachpole", email: "karunnyapachpole6@gmail.com", role: "Frontend" },
  { name: "Ajinkya Bhalerao", email: "ajinkyabhalerao_comp@moderncoe.edu.in", role: "DevOps & Testing" },
];

function ContactModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="contact-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(10, 12, 30, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Blue radial glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(900px, 90vw)",
            height: "min(900px, 90vw)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(80, 120, 255, 0.18) 0%, rgba(60, 100, 255, 0.06) 40%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Secondary glow */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "40%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(140, 80, 255, 0.1) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* Modal card wrapper for centering without framer motion conflict */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          pointerEvents: "none", // let clicks pass through to backdrop unless on the modal
        }}
      >
        <motion.div
          key="contact-modal"
          className="contact-modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.45, ease: EASE }}
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: "auto", // restore clicks for the modal
            width: "min(600px, 92vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--card)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid var(--line)",
          borderRadius: 24,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent 0%, var(--peri-ink) 30%, var(--orange) 70%, transparent 100%)" }} />

        <div style={{ padding: "clamp(24px, 3vw, 36px)" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--peri-ink)" }}>
                The Team Behind PackWise
              </span>
              <h3 style={{
                fontFamily: "var(--display)", fontWeight: 800,
                fontSize: 28, color: "var(--ink)",
                letterSpacing: "-0.03em", margin: "8px 0 0",
                lineHeight: 1.15,
              }}>
                Get in touch.
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32, height: 32, borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--muted)", fontSize: 16,
                cursor: "pointer", display: "grid", placeItems: "center",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-2)"; e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              ✕
            </button>
          </div>

          {/* Team grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
            {TEAM.map((member, i) => (
              <motion.a
                key={member.email}
                href={`mailto:${member.email}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: EASE }}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  textDecoration: "none",
                  transition: "background 0.25s, border-color 0.25s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-2)"; e.currentTarget.style.borderColor = "var(--peri-ink)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.borderColor = "var(--line)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: `hsl(${220 + i * 25}, 70%, ${55 + i * 4}%)`,
                    display: "grid", placeItems: "center", flexShrink: 0,
                    fontSize: 12, fontWeight: 800, color: "#fff",
                  }}>
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                      {member.role}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--peri-ink)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.email}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          padding: "14px clamp(24px, 3vw, 36px)",
          borderTop: "1px solid var(--line)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Team Claudes Plan</span>
          <a
            href="https://github.com/archit7-beep/PackWise"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, fontWeight: 600, color: "var(--peri-ink)", textDecoration: "none", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            View on GitHub →
          </a>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Footer() {
  const [showContact, setShowContact] = useState(false);
  const openContact = useCallback((e: React.MouseEvent) => { e.preventDefault(); setShowContact(true); }, []);
  const closeContact = useCallback(() => setShowContact(false), []);

  return (
    <>
      <footer
        style={{
          padding: "0 var(--pad)",
          maxWidth: "var(--wrap)",
          marginInline: "auto",
        }}
      >
        {/* ── Large CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ padding: "clamp(80px, 14vh, 160px) 0 clamp(60px, 10vh, 120px)" }}
        >
          <a
            href="/#top"
            id="footer-cta"
            style={{
              display: "block",
              fontFamily: "var(--display)",
              fontWeight: 900,
              fontSize: "clamp(48px, 9vw, 140px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.92,
              color: "var(--ink)",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--orange)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}
          >
            <span style={{ display: "block" }}>Scan your first</span>
            <span style={{ display: "block", color: "var(--orange)" }}>product.</span>
          </a>

          <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <a className="btn btn--solid btn--lg" href="/#top" id="footer-scan-btn">
              <span>Get Started — Free</span>
            </a>
            <span style={{ display: "flex", alignItems: "center", fontSize: 14, color: "var(--muted)" }}>
              No sign-up required · Instant report
            </span>
          </div>
        </motion.div>

        {/* ── Dark footer block ── */}
        <div
          style={{
            background: "var(--ink-2)",
            borderRadius: "28px 28px 0 0",
            padding: "clamp(48px, 6vw, 72px) clamp(32px, 4vw, 56px) clamp(28px, 3vw, 40px)",
            color: "var(--bg)",
            marginInline: "calc(-1 * var(--pad))",
          }}
        >
          {/* Top row: Brand + Nav columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "clamp(24px, 3vw, 48px)", marginBottom: "clamp(48px, 7vh, 80px)" }} className="footer-grid">
            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--orange)",
                    display: "grid", placeItems: "center",
                    fontSize: 13, fontWeight: 900, color: "#fff",
                  }}
                >PW</span>
                <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>PackWise</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(244,242,236,0.4)", margin: "0 0 24px", maxWidth: 260 }}>
                AI-powered packaging compliance for Indian FMCG products. Built on Legal Metrology &amp; FSSAI rules.
              </p>
              <a
                href="https://github.com/archit7-beep/PackWise"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 18px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 13, fontWeight: 600,
                  color: "rgba(244,242,236,0.6)",
                  textDecoration: "none",
                  transition: "background 0.25s, color 0.25s, border-color 0.25s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(244,242,236,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                Star on GitHub
              </a>
            </div>

            {/* Product column */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(244,242,236,0.3)", margin: "0 0 20px" }}>Product</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Upload & Scan", href: "/#top" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Compliance Engine", href: "/#compliance" },
                  { label: "OCR Pipeline", href: "/#ocr" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    style={{ fontSize: 14, color: "rgba(244,242,236,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(244,242,236,0.5)")}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Resources column */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(244,242,236,0.3)", margin: "0 0 20px" }}>Resources</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "LMPC Rules, 2011", href: "https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/Legal_Metrology_Packaged_Commodities_Rules_2011.pdf", ext: true },
                  { label: "FSSAI Act, 2006", href: "https://www.fssai.gov.in/cms/food-safety-and-standards-act-2006.php", ext: true },
                  { label: "FOSCOS Portal", href: "https://foscos.fssai.gov.in/", ext: true },
                  { label: "GitHub Repository", href: "https://github.com/archit7-beep/PackWise", ext: true },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.ext ? "_blank" : undefined}
                    rel={l.ext ? "noopener noreferrer" : undefined}
                    style={{ fontSize: 14, color: "rgba(244,242,236,0.5)", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 4 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(244,242,236,0.5)")}
                  >
                    {l.label}
                    {l.ext && <span style={{ fontSize: 10, opacity: 0.4 }}>↗</span>}
                  </a>
                ))}
              </nav>
            </div>

            {/* Team column */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(244,242,236,0.3)", margin: "0 0 20px" }}>Team</h4>
              <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <a
                  href="#"
                  onClick={openContact}
                  style={{ fontSize: 14, color: "rgba(244,242,236,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(244,242,236,0.5)")}
                >
                  Contact Us
                </a>
                <span style={{ fontSize: 14, color: "rgba(244,242,236,0.35)" }}>Team Claudes Plan</span>
                <span style={{ fontSize: 14, color: "rgba(244,242,236,0.7)", fontWeight: 500 }}>Built with 🧠</span>
              </nav>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />

          {/* Bottom row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(244,242,236,0.25)" }}>
              © 2026 PackWise. All rights reserved.
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 12, color: "rgba(244,242,236,0.25)" }}>
                Designed &amp; engineered by Team Claudes Plan
              </span>
              <span style={{ fontSize: 12, color: "rgba(244,242,236,0.15)" }}>·</span>
              <a
                href="https://github.com/archit7-beep/PackWise"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "rgba(244,242,236,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(244,242,236,0.7)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(244,242,236,0.3)")}
              >
                github.com/archit7-beep/PackWise
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <button
        className="to-top"
        id="toTop"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      {/* Contact Modal */}
      {showContact && <ContactModal onClose={closeContact} />}
    </>
  );
}
