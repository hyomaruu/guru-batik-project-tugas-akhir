import type { Metadata } from "next";
import Image from "next/image";
import ScrollReveal from "@/components/public/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/public/MotionWrappers";
import BatikMotif from "@/components/public/BatikMotif";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Guru Batik — Menghidupkan Kenangan, Melestarikan Budaya.",
};

export default function TentangPage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-36 pb-20 px-6"
        style={{ backgroundColor: "#020617" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <BatikMotif variant="tech-batik" opacity={0.08} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] mb-6"
            style={{ color: "rgba(96,165,250,0.8)" }}
          >
            <span className="w-5 h-px" style={{ background: "rgba(96,165,250,0.5)" }} />
            Tentang Kami
            <span className="w-5 h-px" style={{ background: "rgba(96,165,250,0.5)" }} />
          </div>
          <h1
            className="font-bold text-white mb-6"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            Menghidupkan Kenangan,<br />
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1e3a5f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Melestarikan Budaya
            </span>
          </h1>
          <p className="text-lg text-center" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "48rem", margin: "0 auto", lineHeight: "1.8" }}>
            Halo, <strong>Tematik (Teman Berbatik)!</strong> Selamat datang di Guru Batik. Kami percaya bahwa setiap lembar kain memiliki cerita, dan di sini, kami memadukan kecintaan pada budaya Indonesia dengan semangat dunia pendidikan.
          </p>
        </div>
      </section>

      {/* Awal Mula & Motif */}
      <section className="pub-section-light relative" id="about-story">
        <BatikMotif variant="parang" opacity={0.03} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <div className="pub-section-eyebrow">
                  <span className="w-5 h-px bg-batik-primary/60" />
                  Kisah Kami
                </div>
                <h2 className="pub-section-title mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Awal Mula Perjalanan
                </h2>
                <p className="text-batik-muted leading-relaxed mb-6">
                  Kisah kami dimulai pada tahun 2015 oleh Dheni Nugroho. Bermula dari sebuah ide dan dukungan dana Program Kreativitas Mahasiswa (PKM), Guru Batik perlahan tumbuh.
                </p>
                <p className="text-batik-muted leading-relaxed">
                  Meski dibangun dari nol, tekad kami satu: menghadirkan pakaian batik yang bermakna bagi berbagai instansi pendidikan—dari sekolah dasar hingga universitas, baik untuk seragam harian, seminar, maupun acara khusus lainnya.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="batik-frame p-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-xl mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Motif Penuh Memori Masa Sekolah
                </h3>
                <p className="text-sm text-batik-muted leading-relaxed">
                  Pernahkah Anda membayangkan rumus matematika, struktur senyawa kimia, atau sandi morse Pramuka tertuang indah dalam selembar kain batik? Di Guru Batik, kami mewujudkannya! 
                  <br/><br/>
                  Kami merancang motif-motif unik yang terinspirasi dari mata pelajaran sekolah, olahraga, permainan tradisional, hingga memori keseruan &quot;jam kosong&quot;. Desain kontemporer ini kami ciptakan khusus untuk membangkitkan kembali kenangan indah masa sekolah Anda.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Karya Tangan Pengrajin */}
      <section className="pub-section-dark relative" id="about-craft">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up">
            <div className="pub-section-eyebrow justify-center">
              <span className="w-5 h-px bg-batik-primary/60" />
              Batik Asli
              <span className="w-5 h-px bg-batik-primary/60" />
            </div>
            <h2 className="pub-section-title mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Karya Tangan Pengrajin Lokal
            </h2>
            <p className="text-batik-muted leading-relaxed text-lg mb-8">
              Walaupun tampil dengan desain kekinian, kami tetap setia pada akar tradisi. Setiap produk Guru Batik adalah batik asli (cap dan tulis) yang diproses secara manual menggunakan malam panas.
            </p>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 inline-block text-left shadow-lg">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 flex-shrink-0">
                  <span className="text-blue-400 text-xl font-serif italic">i</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Tahukah Anda?</h4>
                  <p className="text-sm text-batik-muted leading-relaxed max-w-lg">
                    Setiap lembar kain kami dikerjakan setidaknya oleh tiga pasang tangan pengrajin lokal hebat—mulai dari proses mengecap, mewarnai, hingga melorot (menghilangkan malam). Memilih produk kami berarti Anda turut serta menghidupi komunitas pengrajin lokal di sekitar kami.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Inovasi */}
      <section className="pub-section-light relative" id="about-innovation">
        <BatikMotif variant="mega-mendung" opacity={0.03} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="pub-section-eyebrow justify-center">
                <span className="w-5 h-px bg-batik-primary/60" />
                Inovasi
                <span className="w-5 h-px bg-batik-primary/60" />
              </div>
              <h2 className="pub-section-title mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Terus Berinovasi, Melangkah Lebih Jauh
              </h2>
              <p className="text-batik-muted leading-relaxed max-w-2xl mx-auto">
                Kami tidak hanya berhenti di lingkungan sekolah. Guru Batik terus bergerak mengikuti tren generasi muda dan berkolaborasi lintas industri.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
            <StaggerItem className="h-full">
              <div className="batik-frame p-8 h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "rgba(30,58,95,0.3)", color: "#93c5fd" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Kancah Esports Internasional
                </h3>
                <p className="text-sm text-batik-muted leading-relaxed">
                  Kami bangga menjadi bagian dari Free Fire World Series Global Final bersama Garena. Melalui motif tradisional Grompol dan Nitik, kami membawa filosofi ketekunan para atlet esports ke dalam merchandise fisik maupun pakaian in-game.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="h-full">
              <div className="batik-frame p-8 h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "rgba(30,58,95,0.3)", color: "#93c5fd" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-xl mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Gaya Hidup & Skena Kopi
                </h3>
                <p className="text-sm text-batik-muted leading-relaxed">
                  Sebagai satu-satunya brand fesyen di Jogja Coffee Week, kami merancang motif khusus seperti biji kopi dan senyawa kafein yang disulap menjadi kemeja serta rompi (vest) kekinian untuk para barista dan anak muda pencinta kopi.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Visi Kami */}
      <section className="pub-section-dark relative text-center" id="about-vision">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="scale">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
              Visi Kami
            </h2>
            <p className="text-xl text-blue-200/80 leading-relaxed mb-10 font-medium max-w-3xl mx-auto">
              Fokus utama kami adalah mendengarkan apa yang Anda butuhkan dan menghadirkan produk yang relevan. Kami memiliki satu misi besar: 
              <span className="text-white"> mengajak generasi muda untuk terus bangga mengenakan batik asli dalam aktivitas sehari-hari agar identitas bangsa tidak hilang.</span>
            </p>
            <div className="inline-block p-[1px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }}>
              <div className="px-8 py-4 rounded-full bg-slate-900 text-batik-muted text-sm sm:text-base">
                Mari bersama-sama merawat warisan budaya. <strong className="text-blue-400">Temukan kembali cerita sekolahmu dalam setiap helai Guru Batik!</strong>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Lokasi & Kontak (dari yang lama) */}
      <section className="pub-section-light relative border-t border-white/5" id="about-location">
        <BatikMotif variant="circles" opacity={0.03} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="pub-section-eyebrow justify-center">
                <span className="w-5 h-px bg-batik-primary/60" />
                Kunjungi Kami
                <span className="w-5 h-px bg-batik-primary/60" />
              </div>
              <h2 className="pub-section-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Pusat Kerajinan Guru Batik
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <ScrollReveal direction="left" className="h-full">
              <div className="pub-feature-card h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-6">Hubungi Kami</h3>
                <p className="text-white/60 text-base leading-relaxed mb-8">
                  Tertarik dengan koleksi batik kami atau ingin membuat pesanan khusus? 
                  Tim kami siap membantu Anda dengan layanan terbaik.
                </p>
                <ul className="space-y-6 mb-8">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Alamat</p>
                      <span className="text-white/70 text-sm leading-relaxed block">
                        Jl. Komojoyo No.8, Mrican, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Telepon / WhatsApp</p>
                      <span className="text-white/70 text-sm block">+62 851-5687-0421</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Email</p>
                      <span className="text-white/70 text-sm block">tokogurubatik@gmail.com</span>
                    </div>
                  </li>
                </ul>
                <a
                  href="https://wa.me/6285156870421"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pub-btn-primary self-start"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi via WhatsApp
                </a>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="right" className="h-[500px]">
              <div className="pub-map-container h-full">
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
