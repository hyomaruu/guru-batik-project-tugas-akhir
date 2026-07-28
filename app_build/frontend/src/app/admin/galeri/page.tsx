"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { adminGalleryApi, adminArticleApi } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import EmptyState from "@/components/admin/EmptyState"; // ADDED
import { Image as ImageIcon } from "lucide-react"; // ADDED

export default function AdminGaleriPage() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formId, setFormId] = useState<number | null>(null);
  const [category, setCategory] = useState("Motif Batik");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [src, setSrc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGalleryApi.list()
      .then((r) => {
        setGalleries(r.data || []);
      })
      .catch(() => toast.error("Gagal memuat galeri"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    if (!confirm(`Hapus item galeri ini?`)) return;
    try {
      await adminGalleryApi.delete(id);
      toast.success("Item berhasil dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus item");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await adminArticleApi.uploadImage(file);
      if (data.success && data.data.url) {
        setSrc(data.data.url);
        toast.success("Gambar berhasil diunggah");
      } else {
        toast.error(data.message || "Gagal unggah gambar");
      }
    } catch {
      toast.error("Terjadi kesalahan saat unggah");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!src) return toast.error("Gambar harus diisi!");
    const data = { category, alt, caption, src };

    try {
      if (formId) {
        await adminGalleryApi.update(formId, data);
        toast.success("Berhasil diubah");
      } else {
        await adminGalleryApi.create(data);
        toast.success("Berhasil ditambahkan");
      }
      setShowModal(false);
      load();
    } catch {
      toast.error("Gagal menyimpan data");
    }
  }

  function openCreate() {
    setFormId(null);
    setCategory("Motif Batik");
    setAlt("");
    setCaption("");
    setSrc("");
    setShowModal(true);
  }

  function openEdit(g: any) {
    setFormId(g.id);
    setCategory(g.category);
    setAlt(g.alt);
    setCaption(g.caption);
    setSrc(g.src);
    setShowModal(true);
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Manajemen Galeri</h2>
          <p className="text-sm text-muted">{galleries.length} item total</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          Tambah Galeri
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      ) : galleries.length === 0 ? (
        <EmptyState
          title="Galeri Kosong"
          message="Tambahkan gambar ke galeri untuk ditampilkan di website."
          icon={ImageIcon}
        >
          <button onClick={openCreate} className="admin-btn-primary mt-4">
            + Tambah Foto Pertama
          </button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleries.map(g => (
            <div key={g.id} className="admin-card p-2 group relative overflow-hidden flex flex-col">
              <div className="aspect-square relative rounded bg-canvas-soft-2 mb-2 overflow-hidden">
                <img src={g.src} alt={g.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(g)} className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(g.id)} className="p-2 bg-error rounded-full text-white hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="px-1 pb-1">
                <span className="text-[10px] font-bold text-muted uppercase">{g.category}</span>
                <p className="text-sm font-medium text-ink truncate">{g.alt || "Tanpa Judul"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="admin-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{formId ? "Edit Galeri" : "Tambah Galeri"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Kategori</label>
                <select className="admin-input" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Motif Batik">Motif Batik</option>
                  <option value="Proses Membatik">Proses Membatik</option>
                  <option value="Koleksi">Koleksi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Judul Singkat (Alt)</label>
                <input type="text" className="admin-input" value={alt} onChange={e => setAlt(e.target.value)} required />
              </div>
              <div>
                <label className="admin-label">Caption / Deskripsi</label>
                <textarea className="admin-input" rows={3} value={caption} onChange={e => setCaption(e.target.value)}></textarea>
              </div>
              <div>
                <label className="admin-label">Gambar</label>
                <div className="flex items-end gap-3">
                  {src && <img src={src} alt="Preview" className="w-16 h-16 object-cover rounded border" />}
                  <div className="flex-1">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="admin-btn-secondary w-full">
                      {isUploading ? "Mengunggah..." : "Pilih Gambar"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-hairline">
                <button type="button" onClick={() => setShowModal(false)} className="admin-btn-secondary">Batal</button>
                <button type="submit" disabled={isUploading} className="admin-btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
