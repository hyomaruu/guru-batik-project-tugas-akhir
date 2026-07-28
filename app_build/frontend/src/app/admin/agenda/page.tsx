"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { adminAgendaApi, adminArticleApi } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import EmptyState from "@/components/admin/EmptyState"; // ADDED
import { Calendar } from "lucide-react"; // ADDED

export default function AdminAgendaPage() {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formId, setFormId] = useState<number | null>(null);
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Lainnya");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminAgendaApi.list()
      .then((r) => {
        setAgendas(r.data || []);
      })
      .catch(() => toast.error("Gagal memuat agenda"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: number) {
    if (!confirm(`Hapus agenda ini?`)) return;
    try {
      await adminAgendaApi.delete(id);
      toast.success("Agenda berhasil dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus agenda");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await adminArticleApi.uploadImage(file);
      if (data.success && data.data.url) {
        setImageUrl(data.data.url);
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
    if (!title) return toast.error("Judul harus diisi!");
    const data = { day, date, time, end_time: endTime, title, category, description, location, image_url: imageUrl };

    try {
      if (formId) {
        await adminAgendaApi.update(formId, data);
        toast.success("Berhasil diubah");
      } else {
        await adminAgendaApi.create(data);
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
    setDay("Hari 1"); setDate(""); setTime("08:00"); setEndTime("10:00");
    setTitle(""); setCategory("Workshop"); setDescription(""); setLocation(""); setImageUrl("");
    setShowModal(true);
  }

  function openEdit(a: any) {
    setFormId(a.id);
    setDay(a.day || ""); setDate(a.date || ""); setTime(a.time || ""); setEndTime(a.end_time || "");
    setTitle(a.title || ""); setCategory(a.category || ""); setDescription(a.description || "");
    setLocation(a.location || ""); setImageUrl(a.image_url || "");
    setShowModal(true);
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Manajemen Agenda</h2>
          <p className="text-sm text-muted">{agendas.length} jadwal total</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          Tambah Jadwal
        </button>
      </div>

      {/* Tabel */}
      <div className="admin-card p-0 overflow-x-auto">
        <table className="admin-table w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="pl-6">Hari/Tanggal</th>
              <th>Waktu</th>
              <th>Acara</th>
              <th>Lokasi</th>
              <th className="pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Memuat...</td></tr>
            ) : agendas.length === 0 ? (
              <tr className="border-none hover:bg-transparent">
                <td colSpan={5} className="py-16">
                  <EmptyState
                    title="Belum ada agenda"
                    message="Tambahkan agenda baru untuk ditampilkan di website."
                    icon={Calendar}
                  >
                    <button onClick={openCreate} className="admin-btn-primary mt-4">
                      + Tambah Agenda Pertama Anda
                    </button>
                  </EmptyState>
                </td>
              </tr>
            ) : (
              agendas.map(a => (
                <tr key={a.id}>
                  <td className="pl-6">
                    <div className="text-sm font-medium">{a.day}</div>
                    <div className="text-xs text-muted">{a.date}</div>
                  </td>
                  <td className="text-sm">{a.time} - {a.end_time}</td>
                  <td>
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="text-xs text-muted bg-canvas-soft-2 inline-block px-2 py-0.5 rounded mt-1">{a.category}</div>
                  </td>
                  <td className="text-sm">{a.location}</td>
                  <td className="pr-6 text-right space-x-2">
                    <button onClick={() => openEdit(a)} className="text-link hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-error hover:underline text-sm">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="admin-card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{formId ? "Edit Agenda" : "Tambah Agenda"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="admin-label">Hari (Misal: Hari 1)</label><input type="text" className="admin-input" value={day} onChange={e => setDay(e.target.value)} required /></div>
                <div><label className="admin-label">Tanggal (Opsional)</label><input type="text" className="admin-input" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div><label className="admin-label">Jam Mulai</label><input type="text" className="admin-input" value={time} onChange={e => setTime(e.target.value)} required /></div>
                <div><label className="admin-label">Jam Selesai</label><input type="text" className="admin-input" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
              </div>
              <div><label className="admin-label">Judul Acara</label><input type="text" className="admin-input" value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Kategori</label>
                  <select className="admin-input" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Pameran">Pameran</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div><label className="admin-label">Lokasi</label><input type="text" className="admin-input" value={location} onChange={e => setLocation(e.target.value)} /></div>
              </div>
              <div><label className="admin-label">Deskripsi</label><textarea className="admin-input" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea></div>
              <div>
                <label className="admin-label">Gambar (Opsional)</label>
                <div className="flex items-end gap-3">
                  {imageUrl && <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded border" />}
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
