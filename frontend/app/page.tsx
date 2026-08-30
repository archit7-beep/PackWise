import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Overview from "@/components/Overview";
import ComplianceSection from "@/components/ComplianceSection";
import AlertsSection from "@/components/AlertsSection";
import Manifesto from "@/components/Manifesto";
import AccuracySection from "@/components/AccuracySection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Grain texture overlay */}
      <div className="grain" aria-hidden="true" />

      {/* Glassmorphism pill navbar */}
      <Navbar />

      <main id="top">
        {/* 1. Hero — WeTransfer-style centered upload */}
        <Hero />

        {/* 2. Overview — Scan pipeline */}
        <Overview />

        {/* 3. Compliance — FSSAI / Legal Metrology */}
        <div id="compliance" style={{ padding: "0 var(--pad)" }}>
          <ComplianceSection />
        </div>

        {/* 4. Alerts — Violation alert cards */}
        <AlertsSection />

        {/* 5. Manifesto — Large editorial text */}
        <Manifesto />

        {/* 6. Accuracy — Trust / transparency badges */}
        <AccuracySection />

        {/* 7. FAQ — Accordion */}
        <FAQSection />
      </main>

      {/* Footer with team credits */}
      <Footer />
    </>
  );
}
