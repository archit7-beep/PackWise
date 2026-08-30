"use client";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export default function Manifesto() {
  return (
    <section className="manifesto">
      <motion.p
        className="manifesto__text"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.0, ease: EASE }}
      >
        You read the label but you don&apos;t understand it.{" "}
        <em>That</em> is the problem. Every packaged product has mandatory
        disclosures — MRP, FSSAI licence, net quantity, ingredients.
        Most people walk past all of it. PackWise turns that fine print into{" "}
        <em>one honest intelligence report</em> you can actually act on.
      </motion.p>
    </section>
  );
}
