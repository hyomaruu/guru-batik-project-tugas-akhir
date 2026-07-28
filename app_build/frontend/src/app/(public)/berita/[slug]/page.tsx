import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { notFound } from "next/navigation";
import ShareButton from "@/components/public/ShareButton";
import ScrollReveal from "@/components/public/ScrollReveal";
import BatikMotif from "@/components/public/BatikMotif";
import { calculateReadTime } from "@/lib/utils"; // ADDED

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await publicApi.getArticle(params.slug);
    const a = res.data;
    return {
      title: a.title,
      description: a.excerpt || a.title,
      openGraph: { title: a.title, description: a.excerpt },
    };
  } catch {
    return { title: "Artikel Tidak Ditemukan" };
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function ArticleDetailPage({ params }: Props) {
  let article: any;
  try {
    const res = await publicApi.getArticle(params.slug);
    article = res.data;
  } catch {
    notFound();
  }

  const readTime = calculateReadTime(article.content);

  return (
    <>
      <section className="relative overflow-hidden pt-40 pb-20 px-6" style={{ backgroundColor: "#020617" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />
        <BatikMotif variant="tech-batik" opacity={0.05} />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal direction="up" delay={0}>
            <nav className="flex items-center justify-center gap-2 text-sm text-blue-200/50 mb-8 font-medium" id="article-breadcrumb">
              <Link href="/" className="hover:text-blue-400 transition-colors">Beranda</Link>
              <span className="text-white/20">/</span>
              <Link href="/berita" className="hover:text-blue-400 transition-colors">Berita</Link>
              <span className="text-white/20">/</span>
              <span className="text-white/80 truncate max-w-[200px] md:max-w-md">{article.title}</span>
            </nav>

            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {article.category || "Umum"}
              </span>
              <span className="text-white/20">•</span>
              <time className="text-sm font-medium text-blue-200/60">{formatDate(article.published_at)}</time>
              <span className="text-white/20">•</span>
              <span className="text-sm font-medium text-blue-200/60">{readTime} min read</span>
            </div>

            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
            >
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto leading-relaxed italic border-l-2 border-blue-500/50 pl-6">
                &quot;{article.excerpt}&quot;
              </p>
            )}
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-24 -mt-10 relative z-20">
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {article.thumbnail && (
              <div className="w-full max-h-[80vh] flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden mb-12 shadow-2xl relative group">
                {/* Blurred Background */}
                <Image
                  src={article.thumbnail}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-110 opacity-30"
                />
                {/* Actual Image */}
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  width={1200}
                  height={675}
                  priority
                  className="relative z-10 max-w-full max-h-[80vh] object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-batik-primary/0 group-hover:bg-batik-primary/10 transition-colors duration-500 pointer-events-none" />
              </div>
            )}

            {/* Content Wrapper */}
            <div className="text-white/80 leading-relaxed text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Footer / Actions */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <Link 
                href="/berita" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-300 border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                id="back-to-news"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Berita
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/50">Bagikan artikel ini:</span>
                <ShareButton title={article.title} />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
