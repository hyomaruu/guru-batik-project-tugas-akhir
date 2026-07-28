import Link from "next/link";
import Image from "next/image";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  thumbnail?: string;
  published_at: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CategoryDot({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    Budaya: "#60a5fa",
    Produk: "#3b82f6",
    Tips:   "#93c5fd",
    Event:  "#2563eb",
  };
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0 inline-block"
      style={{ background: colorMap[category] || "#3b82f6" }}
    />
  );
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article
      className="pub-article-card group shadow-subtle hover:shadow-subtle-hover"
      id={`article-card-${article.id}`}
    >
      {/* Thumbnail */}
      <Link href={`/berita/${article.slug}`} className="block">
        <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/20 relative flex items-center justify-center">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(30,58,95,0.4) 0%, rgba(15,23,42,0.6) 100%)",
              }}
            >
              {/* Batik circle motif placeholder */}
              <svg className="w-14 h-14 opacity-25" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="24" stroke="#60a5fa" strokeWidth="1.5" />
                {[0,1,2,3,4,5,6,7].map(i => {
                  const a = (i * Math.PI * 2) / 8 - Math.PI / 2;
                  return <circle key={i} cx={28 + 24 * Math.cos(a)} cy={28 + 24 * Math.sin(a)} r={1.5} fill="#60a5fa" />;
                })}
                <circle cx="28" cy="28" r="14" stroke="#3b82f6" strokeWidth="1" />
                <circle cx="28" cy="28" r="5" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
                <circle cx="28" cy="28" r="2" fill="#60a5fa" />
              </svg>
              <span className="text-xs text-blue-300/40 font-medium">Guru Batik</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-batik-primary/0 group-hover:bg-batik-primary/5 transition-colors duration-300" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="pub-category-badge">
            <CategoryDot category={article.category} />
            {article.category || "Umum"}
          </span>
          <span className="text-xs text-batik-muted/70">{formatDate(article.published_at)}</span>
        </div>

        {/* Title */}
        <Link href={`/berita/${article.slug}`}>
          <h3
            className="font-bold text-white text-base leading-snug mb-2.5 group-hover:text-blue-300 transition-colors duration-200 line-clamp-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-4">
            {article.excerpt}
          </p>
        )}

        {/* Read more */}
        <Link
          href={`/berita/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 group/link"
          id={`read-more-${article.id}`}
        >
          Baca Selengkapnya
          <svg
            className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
