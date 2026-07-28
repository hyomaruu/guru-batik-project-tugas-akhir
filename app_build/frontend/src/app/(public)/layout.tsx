// src/app/(public)/layout.tsx — Layout untuk portal publik (tema premium warm batik)
import type { Metadata } from "next";
import PublicNavbar from "@/components/public/Navbar";
import PublicFooter from "@/components/public/Footer";

import ReadingProgressBar from "@/components/public/ReadingProgressBar"; // ADDED

export const metadata: Metadata = {
  title: { default: "Guru Batik", template: "%s | Guru Batik" },
  description: "Melestarikan dan memberdayakan seni batik tradisional Indonesia melalui karya yang indah dan bermakna.",
  keywords: ["batik", "guru batik", "batik nusantara", "batik indonesia", "umkm batik"],
  openGraph: {
    siteName: "Guru Batik",
    type: "website",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#020617" }}>
      <ReadingProgressBar /> {/* ADDED */}
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
