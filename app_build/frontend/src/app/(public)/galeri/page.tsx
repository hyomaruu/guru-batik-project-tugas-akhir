// src/app/(public)/galeri/page.tsx — Halaman Galeri (Server Component)
import type { Metadata } from "next";
import GaleriClient from "@/components/public/GaleriClient";


export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto dokumentasi batik — motif, proses membatik, koleksi, dan momen kegiatan Guru Batik.",
};

export default function GaleriPage() {
  return <GaleriClient />;
}
