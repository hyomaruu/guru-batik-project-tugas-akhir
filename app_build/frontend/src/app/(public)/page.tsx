// src/app/(public)/page.tsx — Halaman Beranda Portal Publik (Premium Redesign)
import type { Metadata } from "next";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import ArticleCard from "@/components/public/ArticleCard";
import HeroSection from "@/components/public/HeroSection";
import { StaggerContainer, StaggerItem } from "@/components/public/MotionWrappers";
import ScrollReveal from "@/components/public/ScrollReveal";
import BatikMotif from "@/components/public/BatikMotif";

export const metadata: Metadata = {
  title: "Beranda",
  description: "Guru Batik — Melestarikan keindahan batik nusantara. Temukan berita, agenda, dan galeri batik tradisional Indonesia.",
};

async function getLatestArticles() {
  try {
    const res = await publicApi.getArticles({ limit: "6", page: "1" });
    return res.data?.data || [];
  } catch {
    return [];
  }
}

async function getLatestGalleries() {
  try {
    const res = await publicApi.getGalleries();
    return (res.data || []).slice(0, 4);
  } catch {
    return [];
  }
}

// Static agenda preview data
const agendaPreview = [
  {
    id: 1,
    time: "09.00 WIB",
    title: "Workshop Membatik Tulis",
    description: "Pelajari teknik membatik tulis tradisional bersama pengrajin batik berpengalaman.",
    category: "Workshop",
    location: "Ruang Utama Guru Batik",
  },
  {
    id: 2,
    time: "13.00 WIB",
    title: "Seminar: Batik di Era Digital",
    description: "Diskusi tentang adaptasi batik nusantara di era modern dan pemasaran digital.",
    category: "Seminar",
    location: "Aula Serbaguna",
  },
  {
    id: 3,
    time: "15.30 WIB",
    title: "Pameran Koleksi Musim Ini",
    description: "Tampilkan dan nikmati koleksi batik terbaru dari para pengrajin pilihan.",
    category: "Pameran",
    location: "Galeri Guru Batik",
  },
];



const CATEGORY_BADGE_COLORS: Record<string, string> = {
  Workshop: "#1e3a5f",
  Seminar:  "#1e40af",
  Pameran:  "#1d4ed8",
  Demo:     "#2563eb",
};

export default async function HomePage() {
  const articles = await getLatestArticles();
  const galleries = await getLatestGalleries();

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <HeroSection />



      {/* ── Layanan Kami ────────────────────────────────────────────── */}
      <section className="pub-section-dark relative" id="services">
        <BatikMotif variant="parang" opacity={0.03} />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="pub-section-eyebrow justify-center">
                <span className="w-5 h-px bg-batik-primary/60" />
                Layanan Utama
                <span className="w-5 h-px bg-batik-primary/60" />
              </div>
              <h2 className="pub-section-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Solusi Kebutuhan Batik Anda
              </h2>
            </div>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="pub-feature-card group text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">Seragam Institusi</h3>
                <p className="text-white/60 text-sm leading-relaxed">Pengadaan seragam batik untuk sekolah, universitas, hingga instansi pemerintah dengan standar kualitas tinggi.</p>
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <div className="pub-feature-card group text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">Batik Custom</h3>
                <p className="text-white/60 text-sm leading-relaxed">Desain motif khusus sesuai identitas perusahaan Anda. Eksklusif, elegan, dan penuh makna filosofis.</p>
              </div>
            </StaggerItem>
            
            <StaggerItem>
              <div className="pub-feature-card group text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">Konsultasi Desain</h3>
                <p className="text-white/60 text-sm leading-relaxed">Diskusikan kebutuhan batik Anda dengan tim ahli kami untuk mendapatkan hasil yang sempurna.</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ── Berita Terbaru ─────────────────────────────────────────── */}
      <section className="pub-section-light" id="latest-news">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="pub-section-eyebrow">
                  <span className="w-5 h-px bg-batik-primary/60" />
                  Berita & Artikel
                </div>
                <h2
                  className="pub-section-title"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Informasi Terkini
                </h2>
              </div>
              <Link
                href="/berita"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-batik-primary hover:text-batik-accent transition-colors duration-200 group"
                id="home-all-articles-link"
              >
                Lihat Semua Artikel
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          {articles.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-batik-muted">Belum ada artikel yang diterbitkan.</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a: any) => (
                <StaggerItem key={a.id}>
                  <ArticleCard article={a} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/berita" className="pub-btn-outline" id="home-all-articles-mobile">
              Lihat Semua Artikel
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agenda Preview ─────────────────────────────────────────── */}
      <section className="pub-section-light relative overflow-hidden" id="agenda-preview">
        {/* Decorative diagonal stripe */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent, transparent 60px, rgba(30,58,95,0.025) 60px, rgba(30,58,95,0.025) 61px)",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="pub-section-eyebrow">
                  <span className="w-5 h-px bg-batik-primary/60" />
                  Jadwal Kegiatan
                </div>
                <h2
                  className="pub-section-title"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Agenda Mendatang
                </h2>
              </div>
              <Link
                href="/agenda"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-batik-primary hover:text-batik-accent transition-colors duration-200 group"
                id="home-all-agenda-link"
              >
                Lihat Semua Agenda
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agendaPreview.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border border-batik-border/40 shadow-card-base hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  {/* Time */}
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold mb-4 px-3 py-1 rounded-full self-start"
                    style={{
                      background: "rgba(30,58,95,0.1)",
                      color: "#1e3a5f",
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.time}
                  </span>

                  {/* Category */}
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold self-start mb-3"
                    style={{
                      background: `${CATEGORY_BADGE_COLORS[item.category] || "#1e3a5f"}18`,
                      color: CATEGORY_BADGE_COLORS[item.category] || "#1e3a5f",
                      border: `1px solid ${CATEGORY_BADGE_COLORS[item.category] || "#1e3a5f"}30`,
                    }}
                  >
                    {item.category}
                  </span>

                  <h3
                    className="font-bold text-batik-text text-lg mb-2 flex-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-batik-muted leading-relaxed mb-4">{item.description}</p>

                  {item.location && (
                    <div className="flex items-center gap-1.5 text-xs text-batik-muted/60 mt-auto">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/agenda" className="pub-btn-outline" id="home-all-agenda-mobile">
              Lihat Semua Agenda
            </Link>
          </div>
        </div>
      </section>

      {/* ── Proses Pemesanan ────────────────────────────────────────── */}
      <section className="pub-section-dark relative" id="process">
        <BatikMotif variant="circles" opacity={0.04} />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="pub-section-eyebrow justify-center">
                <span className="w-5 h-px bg-batik-primary/60" />
                Cara Kerja
                <span className="w-5 h-px bg-batik-primary/60" />
              </div>
              <h2 className="pub-section-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Proses Pemesanan Mudah
              </h2>
            </div>
          </ScrollReveal>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 w-3/4 h-px bg-white/10 z-0 border-t border-dashed border-white/20 ml-12"></div>
            
            {[
              { step: "01", title: "Konsultasi", desc: "Diskusikan kebutuhan, jumlah, dan budget." },
              { step: "02", title: "Desain Motif", desc: "Pembuatan sampel desain sesuai identitas." },
              { step: "03", title: "Produksi", desc: "Proses membatik oleh pengrajin profesional." },
              { step: "04", title: "Pengiriman", desc: "Quality control dan pengiriman ke lokasi." }
            ].map((s) => (
              <StaggerItem key={s.step} className="relative z-10 text-center group cursor-default">
                <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl relative transition-all duration-300 group-hover:bg-white/10 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <div className="absolute inset-2 rounded-full border border-blue-500/20 group-hover:border-blue-400/50 transition-colors duration-300"></div>
                  <span className="text-3xl font-bold text-blue-400 font-display">{s.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Gallery Preview ─────────────────────────────────────────── */}
      <section className="pub-section-white" id="gallery-preview">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="pub-section-eyebrow">
                  <span className="w-5 h-px bg-batik-primary/60" />
                  Dokumentasi
                </div>
                <h2
                  className="pub-section-title"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Galeri
                </h2>
              </div>
              <Link
                href="/galeri"
                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-batik-primary hover:text-batik-accent transition-colors duration-200 group"
                id="home-all-gallery-link"
              >
                Lihat Semua Foto
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>

          {/* Gallery preview grid — 4 items with gradient placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleries.length > 0 ? (
              galleries.map((item: any, i: number) => (
                <ScrollReveal key={item.id} delay={i * 80}>
                  <Link
                    href="/galeri"
                    className="group block rounded-2xl overflow-hidden relative cursor-pointer aspect-square bg-canvas-soft"
                    id={`gallery-preview-${i + 1}`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4">
                      <span
                        className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                      >
                        {item.alt || item.category}
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-10 text-white/50">
                Belum ada foto galeri.
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href="/galeri" className="pub-btn-outline" id="home-gallery-cta">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lihat Semua Galeri
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lokasi & Kontak ─────────────────────────────────────────── */}
      <section className="pub-section-dark relative border-t border-white/5" id="location">
        <BatikMotif variant="mega-mendung" opacity={0.03} />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="pub-section-eyebrow justify-center">
                <span className="w-5 h-px bg-batik-primary/60" />
                Kunjungi Kami
                <span className="w-5 h-px bg-batik-primary/60" />
              </div>
              <h2 className="pub-section-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Lokasi Pusat Guru Batik
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ScrollReveal direction="left" className="lg:col-span-1 space-y-6">
              <div className="pub-feature-card">
                <h3 className="text-xl font-bold text-white mb-4">Informasi Kontak</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white/70 text-sm leading-relaxed">
                      Jl. Komojoyo No.8, Mrican, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-white/70 text-sm">+62 851-5687-0421</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white/70 text-sm">tokogurubatik@gmail.com</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/70 text-sm">Senin - Sabtu (08:00 - 16:00 WIB)</span>
                  </li>
                </ul>
              </div>
              <div className="pub-feature-card bg-gradient-to-br from-blue-900/40 to-[#020617] border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-2">Punya Pertanyaan?</h3>
                <p className="text-white/60 text-sm mb-4">Tim kami siap membantu kebutuhan pemesanan batik Anda.</p>
                <Link href="https://wa.me/6285156870421" target="_blank" className="pub-btn-primary w-full justify-center">
                  Hubungi via WhatsApp
                </Link>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" className="lg:col-span-2">
              <div className="pub-map-container">
                <iframe 
                  src="https://maps.google.com/maps?q=Jl.+Komojoyo+No.8+Mrican+Caturtunggal+Depok+Sleman+DIY&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Guru Batik"
                ></iframe>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
