"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function Footer() {
  return (
    <>
      <footer
        style={{
          padding: "clamp(80px, 12vh, 160px) var(--pad) clamp(40px, 6vh, 80px)",
          maxWidth: "var(--wrap)",
          marginInline: "auto",
        }}
      >
        {/* Large footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ marginBottom: "clamp(50px, 8vh, 100px)" }}
        >
          <a
            href="/#top"
            id="footer-cta"
            style={{
              display: "block",
              fontFamily: "var(--display)",
              fontWeight: 900,
              fontSize: "clamp(48px, 9vw, 160px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              color: "var(--ink)",
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
              <span>Scan your first product</span>
            </a>
            <span style={{ display: "flex", alignItems: "center", fontSize: 14, color: "var(--muted)" }}>
              No sign-up required · Instant report
            </span>
          </div>
        </motion.div>

        {/* Footer bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            paddingTop: 32,
            borderTop: "1px solid var(--line)",
          }}
        >
          <a className="brand" href="/" aria-label="PackWise home">
            <span className="brand-icon" style={{ width: 28, height: 28, fontSize: 12 }}>PW</span>
            <span>PackWise</span>
          </a>

          <nav style={{ display: "flex", gap: "clamp(16px, 2.5vw, 32px)", flexWrap: "wrap", fontSize: 14, color: "var(--muted)" }}>
            {[
              { label: "Overview", href: "/#overview", external: false },
              { label: "Dashboard", href: "/dashboard", external: false },
              { label: "Compliance", href: "/#compliance", external: false },
              { label: "GitHub", href: "https://github.com/JatinWatwani/PackWise", external: true },
              { label: "Contact", href: "mailto:packwise@team.com", external: false },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener" : undefined}
                style={{ transition: "color 0.3s", color: "var(--muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {link.label}
              </a>
            ))}
            <span style={{ color: "var(--muted)" }}>© 2026 PackWise. All rights reserved.</span>
          </nav>
        </div>

        {/* Team credit */}
        <div
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 13,
            color: "var(--muted)",
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ opacity: 0.75 }}>✦ </span>
          <span style={{ fontWeight: 600, color: "var(--ink)" }}>Created by Team Claude&apos;s plan</span>
          <span style={{ opacity: 0.75 }}> ✦</span>
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
    </>
  );
}
