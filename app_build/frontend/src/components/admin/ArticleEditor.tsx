"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminArticleApi } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), { ssr: false });

const CATEGORIES = ["Umum", "Budaya", "Produk", "Tips", "Event", "Edukasi"];

interface Props {
  isNew?: boolean;
}

export default function ArticleEditorPage({ isNew = false }: Props) {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Umum");
  const [thumbnail, setThumbnail] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  useEffect(() => {
    if (!isNew && articleId) {
      adminArticleApi.get(+articleId)
        .then((r) => {
          const a = r.data;
          setTitle(a.title);
          setContent(a.content);
          setExcerpt(a.excerpt || "");
          setCategory(a.category || "Umum");
          setThumbnail(a.thumbnail || "");
          setIsPublished(a.is_published ?? a.published ?? false);
        })
        .catch(() => toast.error("Gagal memuat artikel"))
        .finally(() => setLoading(false));
    }
  }, [isNew, articleId]);

  async function handleSave(publish: boolean) {
    if (!title.trim()) { toast.error("Judul wajib diisi"); return; }
    if (!content.trim() || content === "<p></p>") { toast.error("Konten tidak boleh kosong"); return; }

    setSaving(true);
    const data = { title, content, excerpt, category, thumbnail, is_published: publish };

    try {
      if (isNew) {
        await adminArticleApi.create(data);
        toast.success("Artikel berhasil dibuat!");
      } else {
        await adminArticleApi.update(+articleId, data);
        toast.success("Artikel berhasil diupdate!");
      }
      setTimeout(() => router.push("/admin/berita"), 1200);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan artikel");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadThumbnail(file: File) {
    if (!file) return;
    setUploadingThumb(true);
    const toastId = toast.loading("Mengunggah gambar...");
    try {
      const res = await adminArticleApi.uploadImage(file);
      if (res.success && res.data?.url) {
        setThumbnail(res.data.url);
        toast.success("Gambar berhasil diunggah", { id: toastId });
      } else {
        toast.error(res.message || "Gagal mengunggah gambar", { id: toastId });
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan saat mengunggah", { id: toastId });
    } finally {
      setUploadingThumb(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-10 rounded" />
        <div className="skeleton h-64 rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-slide-up" id="article-editor-page">
      {/* Breadcrumb / Nav */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-ink">
            {isNew ? "Tulis Artikel Baru" : "Edit Artikel"}
          </h2>
          <p className="text-sm text-muted">Gunakan editor di bawah untuk menulis konten artikel.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="admin-btn-secondary"
          id="btn-back-articles"
        >
          ← Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor utama */}
        <div className="lg:col-span-2 space-y-4">
          <div className="admin-card space-y-4">
            {/* Judul */}
            <div>
              <label className="admin-label" htmlFor="article-title">Judul Artikel *</label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul artikel..."
                className="admin-input text-base font-medium"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="admin-label" htmlFor="article-excerpt">Ringkasan (Opsional)</label>
              <textarea
                id="article-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat artikel untuk ditampilkan di halaman daftar berita..."
                rows={3}
                className="admin-input h-auto py-2 resize-none"
              />
            </div>

            {/* TipTap Editor */}
            <div>
              <label className="admin-label">Konten Artikel *</label>
              <div className="border border-hairline rounded-md overflow-hidden tiptap-editor">
                <TipTapEditor content={content} onChange={setContent} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          {/* Publish actions */}
          <div className="admin-card space-y-3" id="publish-panel">
            <p className="text-sm font-semibold text-ink">Publikasi</p>
            <div className="flex items-center gap-2 p-3 rounded-md bg-canvas-soft border border-hairline">
              <div className={`w-2 h-2 rounded-full ${isPublished ? "bg-link" : "bg-warning"}`} />
              <span className="text-sm text-body">
                {isPublished ? "Dipublikasikan" : "Draft"}
              </span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setIsPublished(true); handleSave(true); }}
                disabled={saving}
                id="btn-publish-article"
                className="w-full admin-btn-primary justify-center disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : isNew ? "Publikasikan" : "Simpan & Publikasikan"}
              </button>
              <button
                onClick={() => { setIsPublished(false); handleSave(false); }}
                disabled={saving}
                id="btn-save-draft"
                className="w-full admin-btn-secondary justify-center disabled:opacity-50"
              >
                Simpan sebagai Draft
              </button>
            </div>
          </div>

          {/* Kategori */}
          <div className="admin-card space-y-3" id="category-panel">
            <p className="text-sm font-semibold text-ink">Kategori</p>
            <select
              id="article-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Thumbnail */}
          <div className="admin-card space-y-3" id="thumbnail-panel">
            <p className="text-sm font-semibold text-ink">Gambar Thumbnail</p>
            
            {/* Opsi 1: Upload Lokal */}
            <div>
              <label
                className={`flex items-center justify-center gap-2 w-full h-10 px-3 border border-hairline border-dashed rounded-md bg-canvas-soft cursor-pointer hover:border-ink/30 hover:bg-canvas-soft-2 transition-colors ${uploadingThumb ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-sm font-medium text-ink">
                  {uploadingThumb ? "Mengunggah..." : "Pilih dari Komputer"}
                </span>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadThumbnail(file);
                    e.target.value = ''; // Reset input
                  }}
                />
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted my-2">
              <div className="flex-1 border-t border-hairline"></div>
              <span>Atau gunakan URL</span>
              <div className="flex-1 border-t border-hairline"></div>
            </div>

            {/* Opsi 2: URL Teks */}
            <input
              id="article-thumbnail"
              type="url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
              className="admin-input"
            />

            {thumbnail && (
              <img src={thumbnail} alt="preview" className="w-full h-32 object-cover rounded-md border border-hairline mt-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
