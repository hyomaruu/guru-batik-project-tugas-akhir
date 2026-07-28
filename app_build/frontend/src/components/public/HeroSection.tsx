"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import HeroBatikPattern from "@/components/public/HeroBatikPattern";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export default function HeroSection({ title, subtitle }: HeroSectionProps) {
  // Stagger variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        minHeight: "100svh",
        background: "linear-gradient(160deg, #020617 0%, #0a192f 40%, #0f172a 70%, #020617 100%)",
      }}
      id="hero"
    >
      {/* ── Batik Motif Pattern Layer ───────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          className="text-white absolute inset-0"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <HeroBatikPattern />
        </motion.div>

        {/* Blue radial light overlays for depth */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1), transparent 65%)" }}
        />
        <div
          className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(30,58,95,0.15), transparent 65%)" }}
        />
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 pb-24"
        variants={containerVars}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={itemVars} className="inline-flex items-center gap-3 mb-8">
          <span className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.7))" }} />
          <span
            className="text-xs font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border"
            style={{
              color: "rgba(147,197,253,0.9)",
              borderColor: "rgba(59,130,246,0.3)",
              background: "rgba(59,130,246,0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            Batik untuk Pendidikan Indonesia
          </span>
          <span className="h-px w-10" style={{ background: "linear-gradient(270deg, transparent, rgba(96,165,250,0.7))" }} />
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVars}
          className="font-bold text-white leading-[1.08] mb-6"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(2.8rem, 7.5vw, 5.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          {title ? (
            title
          ) : (
            <>
              Menghidupkan{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #93c5fd 40%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Kenangan
              </span>
              <br />
              <span className="text-white/85">Melestarikan Budaya</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVars}
          className="text-base md:text-xl leading-relaxed mb-10 mx-auto"
          style={{
            color: "rgba(203,213,225,0.75)",
            maxWidth: "42rem",
          }}
        >
          {subtitle ||
            "Mari bersama-sama merawat warisan budaya. Temukan kembali cerita dan memori indah sekolahmu dalam setiap helai kreasi Guru Batik."}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVars} className="flex flex-wrap gap-4 justify-center mb-16">
          <Link
            href="/galeri"
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(59,130,246,0.35)]"
            style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}
            id="hero-cta-galeri"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            <svg className="relative z-10 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="relative z-10">Lihat Koleksi</span>
          </Link>

          <Link
            href="/tentang"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-[rgba(30,58,95,0.4)]"
            style={{
              color: "rgba(147,197,253,0.9)",
              border: "1.5px solid rgba(59,130,246,0.35)",
              background: "rgba(30,58,95,0.25)",
              backdropFilter: "blur(10px)",
            }}
            id="hero-cta-tentang"
          >
            Tentang Kami
          </Link>

          <a
            href="https://wa.me/6285156870421"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-[rgba(20,83,45,0.4)]"
            style={{
              color: "rgba(134,239,172,0.9)",
              border: "1.5px solid rgba(34,197,94,0.35)",
              background: "rgba(20,83,45,0.2)",
              backdropFilter: "blur(10px)",
            }}
            id="hero-cta-wa"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.849L.057 23.272a.75.75 0 00.921.921l5.423-1.475A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.944 0-3.77-.5-5.364-1.38l-.386-.218-4.002 1.088 1.088-4.002-.218-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Hubungi Kami
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
