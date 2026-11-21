"use client";

import { motion, useReducedMotion } from "motion/react";

export function HeroArt() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="table-art" />
      <motion.div
        className="ball-float"
        animate={reduceMotion ? undefined : { y: [0, 70, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: ["easeIn", "easeOut"] }}
      />
      <div className="hero-sticker">Prima le persone.<br />Poi il punteggio.</div>
    </div>
  );
}
