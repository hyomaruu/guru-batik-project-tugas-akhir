"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "scale" | "none";
  once?: boolean;
}

export default function ScrollReveal({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up",
  once = true
}: ScrollRevealProps) {
  
  const getVariants = () => {
    switch (direction) {
      case "up":
        return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
      case "left":
        return { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };
      case "right":
        return { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };
      case "scale":
        return { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };
      case "none":
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      default:
        return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-30px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: delay / 1000 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
