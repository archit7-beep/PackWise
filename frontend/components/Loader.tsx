"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";

const LETTERS = "PackWise".split("");

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* Animated brand word */}
          <motion.div
            style={{ display: "flex", alignItems: "baseline", gap: 2, overflow: "hidden" }}
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
            }}
          >
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { y: 60, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.7, ease: EASE },
                  },
                }}
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 900,
                  fontSize: "clamp(52px, 10vw, 120px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  color: i < 4 ? "var(--ink)" : "var(--orange)",
                  display: "inline-block",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6, ease: EASE }}
            style={{
              fontFamily: "var(--font)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            AI · Compliance · Intelligence
          </motion.p>

          {/* Progress bar */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 3,
              background: "var(--orange)",
              originX: 0,
            }}
            initial={{ scaleX: 0, width: "100%" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.0, ease: EASE, delay: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
