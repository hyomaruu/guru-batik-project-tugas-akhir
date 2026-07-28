"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminArticleApi } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBeritaPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminArticleApi.list({ page: String(page), limit: "10" })
      .then((r) => {
        setArticles(r.data?.data || []);
        setTotal(r.data?.total || 0);
        setTotalPages(r.data?.total_pages || 1);
      })
      .catch(() => toast.error("Gagal memuat artikel"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    setDeleting(id);
    try {
      await adminArticleApi.delete(id);
      toast.success("Artikel berhasil dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus artikel");
    } finally {
      setDeleting(null);
    }
  }

  async function handleTogglePublish(article: any) {
    try {
      await adminArticleApi.update(article.id, { is_published: !article.is_published });
      toast.success(article.is_published ? "Artikel dijadikan draft" : "Artikel dipublikasikan");
      load();
    } catch {
      toast.error("Gagal mengubah status artikel");
    }
  }

  return (
    <div className="space-y-5 animate-slide-up" id="admin-berita-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Manajemen Berita</h2>
          <p className="text-sm text-muted">{total} artikel total</p>
        </div>
        <Link href="/admin/berita/baru" className="admin-btn-primary" id="btn-tulis-artikel">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tulis Artikel
        </Link>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-x-auto">
        <table className="admin-table w-full min-w-[800px]" id="articles-table">
          <thead>
            <tr>
              <th className="pl-6">Judul</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th className="pr-6 !text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-10 h-10 text-hairline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-muted">Belum ada artikel</span>
                    <Link href="/admin/berita/baru" className="admin-btn-primary text-xs">Tulis Pertama</Link>
                  </div>
                </td>
              </tr>
            ) : articles.map((a) => (
              <tr key={a.id} id={`article-row-${a.id}`}>
                <td className="pl-6 max-w-xs">
                  <p className="font-medium text-ink text-sm truncate">{a.title}</p>
                  <p className="text-xs text-muted truncate">/berita/{a.slug}</p>
                </td>
                <td><span className="admin-badge admin-badge-neutral">{a.category}</span></td>
                <td>
                  <button
                    onClick={() => handleTogglePublish(a)}
                    id={`toggle-publish-${a.id}`}
                    className={`admin-badge cursor-pointer hover:opacity-80 transition-opacity ${
                      a.is_published ? "admin-badge-success" : "admin-badge-warning"
                    }`}
                  >
                    {a.is_published ? "Dipublikasikan" : "Draft"}
                  </button>
                </td>
                <td className="text-xs text-muted">
                  {new Date(a.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="pr-6">
                  <div className="flex items-center gap-2 justify-center">
                    <Link
                      href={`/admin/berita/${a.id}`}
                      className="admin-btn-secondary h-7 px-3 text-xs"
                      id={`edit-article-${a.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id, a.title)}
                      disabled={deleting === a.id}
                      id={`delete-article-${a.id}`}
                      className="admin-btn-danger h-7 px-3 text-xs disabled:opacity-50"
                    >
                      {deleting === a.id ? "..." : "Hapus"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5" id="articles-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                p === page ? "bg-ink text-white" : "text-muted hover:bg-canvas-soft border border-hairline"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
