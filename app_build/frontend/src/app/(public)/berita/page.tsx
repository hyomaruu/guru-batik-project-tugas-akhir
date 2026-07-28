"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import ArticleCard from "@/components/public/ArticleCard";
import BatikMotif from "@/components/public/BatikMotif";
import ScrollReveal from "@/components/public/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/public/MotionWrappers";

const CATEGORIES = ["Semua", "Budaya", "Produk", "Tips", "Event", "Edukasi", "Umum"];

function NewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "9" };
    if (category) params.category = category;
    if (search) params.search = search;

    publicApi.getArticles(params)
      .then((res) => {
        setArticles(res.data?.data || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.total_pages || 1);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category, search, page]);

  function updateParams(key: string, val: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push("/berita?" + p.toString());
  }

  return (
    <>
      {/* Header */}
      <section
        className="relative overflow-hidden pt-40 pb-24 px-6 text-center"
        style={{ backgroundColor: "#020617" }}
        id="news-hero"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(circle at 100% 50%, rgba(30,58,95,0.2) 0%, transparent 50%)",
          }}
        />
        <BatikMotif variant="tech-batik" opacity={0.06} />

        <div className="relative z-10 max-w-3xl mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] mb-6 px-4 py-1.5 rounded-full border"
              style={{ 
                color: "rgba(96,165,250,0.9)",
                borderColor: "rgba(59,130,246,0.3)",
                background: "rgba(59,130,246,0.05)",
                backdropFilter: "blur(8px)",
              }}
            >
              Wawasan & Informasi
            </div>
            <h1
              className="font-bold text-white mb-6 leading-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Berita{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Terkini
              </span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: "rgba(203,213,225,0.7)", margin: "0 auto" }}>
              Ikuti inspirasi, artikel edukatif, dan tips terbaru seputar dunia kerajinan batik asli Indonesia.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24 -mt-8 relative z-20">
        {/* Search + Filter Panel */}
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 mb-12 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search */}
              <div className="relative w-full lg:w-1/3">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari artikel menarik..."
                  defaultValue={search}
                  className="w-full h-12 pl-12 pr-4 text-sm rounded-xl border border-white/5 bg-slate-950/50 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  id="news-search-input"
                  onKeyDown={(e) => e.key === "Enter" && updateParams("search", (e.target as HTMLInputElement).value)}
                />
              </div>

              {/* Categories */}
              <div className="flex-1 w-full overflow-x-auto pb-2 lg:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="flex gap-2 min-w-max">
                  {CATEGORIES.map((cat) => {
                    const isActive = (cat === "Semua" && !category) || cat === category;
                    return (
                      <button
                        key={cat}
                        id={`filter-${cat}`}
                        onClick={() => updateParams("category", cat === "Semua" ? "" : cat)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Results info */}
        {!loading && (
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-blue-500/30" />
              <p className="text-sm text-white/50">
                Menampilkan <span className="font-bold text-white">{articles.length}</span> dari{" "}
                <span className="font-bold text-white">{total}</span> artikel
                {category && <> dalam kategori <span className="font-bold text-blue-400">{category}</span></>}
              </p>
              <span className="w-8 h-px bg-blue-500/30" />
            </div>
          </ScrollReveal>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 p-4 bg-white/5 backdrop-blur-md space-y-4 shadow-xl">
                <div className="h-56 rounded-xl bg-white/5 animate-pulse" />
                <div className="px-2 space-y-3 pb-2">
                  <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-7 bg-white/5 rounded animate-pulse" />
                  <div className="h-5 w-4/5 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-white/5 bg-slate-900/30 backdrop-blur-sm min-h-[300px]">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tidak Ada Hasil</h3>
              <p className="text-white/50 mb-6 max-w-sm">Maaf, kami tidak dapat menemukan artikel yang sesuai dengan kriteria pencarian Anda.</p>
              <button onClick={() => router.push("/berita")} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                Tampilkan Semua
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((a) => (
              <StaggerItem key={a.id}>
                <ArticleCard article={a} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mt-16" id="news-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/berita?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(p) })}`}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    p === page
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] scale-110"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </>
  );
}

export default function BeritaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] animate-pulse" />}>
      <NewsContent />
    </Suspense>
  );
}
