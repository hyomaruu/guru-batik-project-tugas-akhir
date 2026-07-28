"use client";
// src/components/public/GaleriClient.tsx — Client component for Galeri page
import { useState, useEffect } from "react";
import GalleryGrid, { GalleryImage } from "@/components/public/GalleryGrid";
import ScrollReveal from "@/components/public/ScrollReveal";
import BatikMotif from "@/components/public/BatikMotif";

import { publicApi } from "@/lib/api";

export default function GaleriClient() {
  const [filter, setFilter] = useState("Semua");
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getGalleries()
      .then(res => {
        if (res.data) setGalleryImages(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(
    new Set(galleryImages.map((img) => img.category).filter(Boolean))
  ) as string[];

  return (
    <>
      {/* Page Hero */}
      <section
        className="relative overflow-hidden pt-36 pb-20 px-6"
        style={{ backgroundColor: "#020617" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />
        <BatikMotif variant="mega-mendung" opacity={0.08} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] mb-6"
            style={{ color: "rgba(59,130,246,0.8)" }}
          >
            <span className="w-5 h-px" style={{ background: "rgba(59,130,246,0.5)" }} />
            Galeri Dokumentasi
            <span className="w-5 h-px" style={{ background: "rgba(59,130,246,0.5)" }} />
          </div>
          <h1
            className="font-bold text-white mb-4"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Jejak Karya{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1e3a5f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Nusantara
            </span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "42rem", margin: "0 auto" }}>
            Kumpulan momen, proses, dan hasil karya pengrajin binaan Guru Batik.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-[#0f172a] border-b border-batik-border/10">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <GalleryGrid images={galleryImages} categories={categories} showFilter={true} />
          </ScrollReveal>


        </div>
      </section>
    </>
  );
}
