"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export function RevealSection({ children, className, id, delay = 0 }: RevealSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.section>
  );
}
