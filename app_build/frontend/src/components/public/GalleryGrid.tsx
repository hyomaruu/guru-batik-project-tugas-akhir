"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, Variants, AnimatePresence } from "framer-motion";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const staggerItemUp: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  caption?: string;
  category?: string;
  aspectRatio?: "square" | "portrait" | "landscape";
}

// Lightbox component
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[currentIndex];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Lightbox galeri"
    >
      {/* Close button */}
      <button
        className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors"
        onClick={onClose}
        aria-label="Tutup lightbox"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors hidden md:block"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Foto sebelumnya"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="flex flex-col items-center gap-6 max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={img.src}
          alt={img.alt}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
        {img.caption && (
          <p className="text-white/70 text-sm text-center max-w-lg">{img.caption}</p>
        )}
        <div className="flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                // handled via onPrev/onNext for now — skip
              }}
              className={`rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/10 hover:bg-white/25 text-white rounded-full transition-colors hidden md:block"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Foto berikutnya"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  );
}

interface GalleryGridProps {
  images: GalleryImage[];
  categories?: string[];
  showFilter?: boolean;
}

export default function GalleryGrid({ images, categories, showFilter = true }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Semua");

  const allCategories = categories ||
    Array.from(new Set(images.map((img) => img.category).filter(Boolean))) as string[];

  const filtered =
    activeCategory === "Semua"
      ? images
      : images.filter((img) => img.category === activeCategory);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  }, [filtered.length]);

  return (
    <div>
      {/* Category filter */}
      {showFilter && allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {["Semua", ...allCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)]"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/15 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((img, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
              key={img.id}
              className="group relative overflow-hidden rounded-2xl cursor-pointer bg-[#1e293b] aspect-square flex items-center justify-center shadow-lg border border-white/5"
              onClick={() => openLightbox(i)}
              role="button"
              tabIndex={0}
              aria-label={`Buka foto: ${img.alt}`}
              onKeyDown={(e) => e.key === "Enter" && openLightbox(i)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
              {/* Category label */}
              {img.category && (
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                    {img.category}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-batik-muted">Tidak ada foto untuk kategori ini.</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filtered}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}
