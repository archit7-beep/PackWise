// Shared Framer Motion variants and easing for PackWise
import type { Variants } from "framer-motion";

// Subscrr's exact easing as a tuple (Framer Motion requires 4-number tuples for cubic-bezier)
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const SPRING_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export const reveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.7, ease: EASE, delay },
});
