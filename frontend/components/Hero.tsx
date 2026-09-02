"use client";
import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { EASE } from "@/lib/motion";
import { api } from "@/lib/api";

const FILE_BADGES = [
  { label: ".JPG", x: "-48%", y: "-58%", scale: 1.1, opacity: 1.0, delay: 0 },
  { label: ".PNG", x: "105%", y: "-45%", scale: 1.0, opacity: 1.0, delay: 0.15 },
  { label: ".JPEG", x: "-55%", y: "35%", scale: 0.9, opacity: 1.0, delay: 0.3 },
  { label: ".WEBP", x: "115%", y: "40%", scale: 1.0, opacity: 1.0, delay: 0.45 },
];

export default function HeroLanding() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  const uploadFile = async (files: File[]) => {
    if (files.length > 2) {
      setToast({ show: true, message: "You can only upload up to 2 images (Front & Back)." });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
      setDragging(false);
      return;
    }

    const invalidFiles = files.filter(f => !f.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setToast({ show: true, message: "File not supported. Only images for now (PDFs coming soon!)" });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
      setDragging(false);
      return;
    }

    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024); // 10 MB limit
    if (oversizedFiles.length > 0) {
      setToast({ show: true, message: "File is too large. The maximum size is 10 MB." });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
      setDragging(false);
      return;
    }

    setFileName(files.length > 1 ? `${files.length} files selected` : files[0].name);
    try {
      const data = await api.uploadInspection(files);
      setTimeout(() => router.push(`/dashboard?id=${data.id}`), 600);
    } catch (err) {
      console.error("Upload error", err);
      setFileName(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      uploadFile(files);
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

      {/* Editorial eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
        style={{
          fontFamily: "var(--display)",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--orange)",
          marginBottom: 20,
        }}
      >
        LMPC & FSSAI Compliance Engine
      </motion.p>

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
            className="file-badge"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: badge.opacity || 1,
              scale: badge.scale || 1,
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
            onClick={handleBoxClick}
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
                {fileName ? "Redirecting to analysis…" : "JPEG · PNG · WEBP — up to 10MB"}
              </p>
            </motion.div>

            {/* Inner layer 3 (button) */}
            <motion.div style={{ x: layer3X, y: layer3Y }}>
              <label htmlFor="hero-file-upload" className="btn btn--solid btn--lg" style={{ cursor: "pointer" }}>
                <span>Choose File</span>
              </label>
              <input
                ref={fileInputRef}
                id="hero-file-upload"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/*"
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

      {/* Aesthetic Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{
              position: "fixed",
              bottom: 40,
              right: 40,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              background: "var(--card)",
              color: "var(--ink)",
              borderRadius: 16,
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255, 37, 0, 0.1)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{toast.message}</span>
            <button onClick={() => setToast(prev => ({ ...prev, show: false }))} aria-label="Close" style={{ marginLeft: 8, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 6 }}>
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
