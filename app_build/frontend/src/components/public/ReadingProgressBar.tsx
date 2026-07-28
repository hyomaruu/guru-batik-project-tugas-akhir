// app_build/frontend/src/components/public/ReadingProgressBar.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50 origin-[0%] bg-blue-500 shadow-lg shadow-blue-500/50"
      style={{ scaleX }}
    />
  );
}