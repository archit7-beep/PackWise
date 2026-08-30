"use client";
import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { EASE } from "@/lib/motion";

const FILE_BADGES = [
  { label: ".JPG", x: "-42%", y: "-58%", delay: 0 },
  { label: ".PNG", x: "88%", y: "-52%", delay: 0.15 },
  { label: ".PDF", x: "-48%", y: "30%", delay: 0.3 },
  { label: ".WEBP", x: "90%", y: "35%", delay: 0.45 },
  { label: ".HEIC", x: "22%", y: "-70%", delay: 0.6 },
];

export default function HeroLanding() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Cursor parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-200, 200], [6, -6]);
  const rotateY = useTransform(mouseX, [-200, 200], [-6, 6]);
  const layer1X = useTransform(mouseX, [-200, 200], [-8, 8]);
  const layer1Y = useTransform(mouseY, [-200, 200], [-8, 8]);
  const layer2X = useTransform(mouseX, [-200, 200], [-4, 4]);
  const layer2Y = useTransform(mouseY, [-200, 200], [-4, 4]);
  const layer3X = useTransform(mouseX, [-200, 200], [4, -4]);
  const layer3Y = useTransform(mouseY, [-200, 200], [4, -4]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    animate(mouseX, e.clientX - cx, { type: "spring", stiffness: 120, damping: 20 });
    animate(mouseY, e.clientY - cy, { type: "spring", stiffness: 120, damping: 20 });
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    animate(mouseX, 0, { type: "spring", stiffness: 80, damping: 18 });
    animate(mouseY, 0, { type: "spring", stiffness: 80, damping: 18 });
  }, [mouseX, mouseY]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setTimeout(() => router.push("/dashboard"), 600);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setTimeout(() => router.push("/dashboard"), 600);
    }
  };

  return (
    <section
      id="top"
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px var(--pad) 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,37,0,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Live badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 28,
          padding: "6px 16px",
          borderRadius: 100,
          border: "1px solid var(--line)",
          background: "var(--card)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--peri-ink)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span className="dot" style={{ width: 7, height: 7 }} />
        AI-Powered · Product Intelligence
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.8, ease: EASE }}
        style={{
          fontFamily: "var(--display)",
          fontWeight: 900,
          fontSize: "clamp(36px, 5.5vw, 86px)",
          letterSpacing: "-0.04em",
          lineHeight: 1.0,
          textAlign: "center",
          maxWidth: 820,
          margin: "0 0 18px",
        }}
      >
        Scan any product.{" "}
        <em style={{ color: "var(--orange)" }}>Know everything about it.</em>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44, duration: 0.7, ease: EASE }}
        style={{
          color: "var(--muted)",
          fontSize: "clamp(15px, 1.2vw, 18px)",
          textAlign: "center",
          maxWidth: 480,
          margin: "0 0 52px",
          lineHeight: 1.6,
        }}
      >
        Upload a product image and get instant FSSAI compliance, nutrition
        analysis, and sustainability scoring — in under 2 seconds.
      </motion.p>

      {/* ──────────── CURSOR-REACTIVE UPLOAD BOX ──────────── */}
      <motion.div
        ref={boxRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.56, duration: 0.8, ease: EASE }}
        style={{
          position: "relative",
          width: "min(100%, 520px)",
          perspective: 900,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Floating file-type badges */}
        {FILE_BADGES.map((badge) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -9, 0],
            }}
            transition={{
              opacity: { delay: 0.8 + badge.delay, duration: 0.5 },
              scale: { delay: 0.8 + badge.delay, duration: 0.5, type: "spring" },
              y: {
                delay: badge.delay,
                duration: 3.2 + badge.delay * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{
              x: layer3X,
              position: "absolute",
              left: badge.x,
              top: badge.y,
              padding: "7px 14px",
              borderRadius: 100,
              background: "var(--card)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow)",
              fontSize: 13,
              fontWeight: 800,
              fontFamily: "var(--display)",
              letterSpacing: "0.04em",
              color: "var(--orange)",
              zIndex: 10,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {badge.label}
          </motion.div>
        ))}

        {/* 3D tilt container */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              background: dragging ? "rgba(var(--orange-rgb),0.03)" : "var(--card)",
              border: `2px ${dragging ? "solid" : "dashed"} ${dragging ? "var(--orange)" : "rgba(var(--orange-rgb), 0.25)"}`,
              borderRadius: "var(--r-lg)",
              padding: "clamp(44px, 6vw, 72px) clamp(32px, 5vw, 56px)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.25s, background 0.25s",
              boxShadow: "var(--shadow-lg)",
              cursor: "pointer",
            }}
          >
            {/* Inner layer 1 (icon) */}
            <motion.div style={{ x: layer1X, y: layer1Y, display: "inline-block", marginBottom: 20 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: "rgba(var(--orange-rgb), 0.08)",
                  border: "1px solid rgba(var(--orange-rgb), 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  fontSize: 36,
                  transition: "transform 0.3s",
                }}
              >
                {fileName ? "✅" : dragging ? "📂" : "📦"}
              </div>
            </motion.div>

            {/* Inner layer 2 (text) */}
            <motion.div style={{ x: layer2X, y: layer2Y }}>
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  fontSize: "clamp(20px, 2.2vw, 28px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  margin: "0 0 10px",
                }}
              >
                {fileName
                  ? `Scanning ${fileName}…`
                  : dragging
                  ? "Drop to scan"
                  : "Drop your product image"}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 28px" }}>
                {fileName ? "Redirecting to analysis…" : "JPEG · PNG · PDF · WEBP · HEIC — up to 20MB"}
              </p>
            </motion.div>

            {/* Inner layer 3 (button) */}
            <motion.div style={{ x: layer3X, y: layer3Y }}>
              <label htmlFor="hero-file-upload" className="btn btn--solid btn--lg" style={{ cursor: "pointer" }}>
                <span>Choose File</span>
              </label>
              <input
                id="hero-file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.webp,.heic,image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </motion.div>

            {/* Ambient corner glow */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                bottom: -60,
                right: -60,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(var(--orange-rgb),0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        <span>Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1.5, height: 38, background: "linear-gradient(var(--muted), transparent)" }}
        />
      </motion.div>
    </section>
  );
}
