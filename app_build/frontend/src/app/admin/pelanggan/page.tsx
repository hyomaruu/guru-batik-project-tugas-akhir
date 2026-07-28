"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { adminCustomerApi } from "@/lib/api";
import type { Customer, PaginatedData } from "@/lib/types";
import toast, { Toaster } from "react-hot-toast";
import Papa from "papaparse";
import { exportToPDF } from "@/lib/pdf";
import CustomerModal from "@/components/admin/CustomerModal";
import { FileDown, Plus, Search, Trash2, Upload } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

export default function AdminPelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [csvLoading, setCsvLoading] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[] | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "15" };
    if (search) params.search = search;
    adminCustomerApi.list(params)
      .then((r) => {
        const paged = r.data as PaginatedData<Customer>;
        setCustomers(paged.data ?? []);
        setTotal(paged.total ?? 0);
        setTotalPages(paged.total_pages ?? 1);
      })
      .catch(() => toast.error("Gagal memuat pelanggan"))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  function handleCSVFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvPreview(result.data.slice(0, 5));
      },
    });
  }

  async function handleCSVUpload() {
    const file = csvInputRef.current?.files?.[0];
    if (!file) { toast.error("Pilih file CSV terlebih dahulu"); return; }
    setCsvLoading(true);
    try {
      const res = await adminCustomerApi.uploadCSV(file);
      if (res.success) {
        toast.success(`Berhasil import ${res.data.inserted} baris data`);
        if (res.data.skipped > 0) toast.error(`${res.data.skipped} baris dilewati`);
        setCsvPreview(null);
        setCsvFileName("");
        if (csvInputRef.current) csvInputRef.current.value = "";
        load();
      } else {
        toast.error(res.message || "Upload gagal");
      }
    } catch {
      toast.error("Gagal upload CSV");
    } finally {
      setCsvLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Hapus pelanggan "${name}"?`)) return;
    try {
      await adminCustomerApi.delete(id);
      toast.success("Pelanggan dihapus");
      load();
    } catch { toast.error("Gagal menghapus"); }
  }

  async function handleExportPDF() {
    if (total === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    
    const loadingToast = toast.loading("Menyiapkan PDF...");
    try {
      const res = await adminCustomerApi.list({ limit: "10000", search });
      const allCustomers = res.data?.data || [];
      
      await exportToPDF({
        title: "Data Pelanggan",
        columns: ["Nama", "Email", "Telepon"],
        data: allCustomers.map((c) => [
          c.name,
          c.email || "-",
          c.phone || "-",
        ]),
        filename: "Data_Pelanggan.pdf",
      });
      toast.success("Berhasil didownload", { id: loadingToast });
    } catch (e) {
      toast.error("Gagal membuat PDF", { id: loadingToast });
    }
  }

  return (
    <div className="space-y-5 animate-slide-up" id="admin-pelanggan-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Manajemen Pelanggan</h2>
          <p className="text-sm text-muted mt-0.5">Kelola data pelanggan dan riwayat transaksi.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button onClick={handleExportPDF} className="admin-btn-secondary flex-1 sm:flex-none justify-center" id="btn-export-pdf-pelanggan">
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button onClick={() => setShowForm(true)} className="admin-btn-primary flex-1 sm:flex-none justify-center" id="btn-add-customer">
            <Plus className="w-4 h-4" />
            Pelanggan
          </button>
        </div>
      </div>

      {/* ─── Import CSV ───────────────────────────────────────────── */}
      <div className="admin-card mb-2" id="csv-upload-section">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-semibold text-ink">Import Data via CSV</p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Format: <span className="font-mono bg-canvas-soft px-1 py-0.5 rounded break-all sm:break-normal">name, email, phone, address, transaction_date (YYYY-MM-DD), amount, description</span>
            </p>
          </div>
          <a
            href="data:text/csv;charset=utf-8,name,email,phone,address,transaction_date,amount,description%0ASiti Rahayu,siti@email.com,081234567001,Solo,2024-01-15,350000,Batik Tulis"
            download="template_guru_batik.csv"
            className="admin-btn-secondary text-xs shrink-0 whitespace-nowrap"
            id="btn-download-template"
          >
            <FileDown className="w-3.5 h-3.5" /> Template CSV
          </a>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label
            htmlFor="csv-file-input"
            className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 px-3 py-2 sm:py-1.5 border border-hairline rounded-md bg-canvas-soft cursor-pointer hover:border-ink/20 transition-colors group dark:border-[#333] dark:bg-[#111] dark:hover:border-white/30"
          >
            <div className="admin-btn-secondary text-xs h-7 px-3 pointer-events-none w-full sm:w-auto justify-center">Pilih File</div>
            <span className="text-xs text-muted truncate w-full sm:w-auto dark:text-gray-400">
              {csvFileName || "Belum ada file terpilih..."}
            </span>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              id="csv-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setCsvFileName(file.name); handleCSVFile(file); }
                else { setCsvFileName(""); }
              }}
              className="hidden"
            />
          </label>
          <button onClick={handleCSVUpload} disabled={csvLoading} id="btn-upload-csv" className="admin-btn-primary disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {csvLoading ? "Mengupload..." : "Upload"}
          </button>
        </div>

        {csvPreview && csvPreview.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <p className="text-xs text-muted mb-2">Preview (5 baris pertama):</p>
            <table className="admin-table text-xs">
              <thead>
                <tr>{Object.keys(csvPreview[0]).map((k) => <th key={k}>{k}</th>)}</tr>
              </thead>
              <tbody>
                {csvPreview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="truncate max-w-[120px]">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Table Container ──────────────────────────────────────── */}
      <div className="admin-card p-0 flex flex-col overflow-x-auto">
        <div className="p-4 border-b border-hairline flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-canvas-soft/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Cari nama, email, telepon..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="admin-input pl-9 w-full bg-canvas/50"
              id="customer-search"
            />
          </div>
          <div className="text-sm text-muted whitespace-nowrap">
            Total: <span className="font-semibold text-ink">{total}</span> pelanggan
          </div>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="admin-table" id="customers-table">
          <thead>
            <tr>
              <th className="pl-6">Nama</th>
              <th>Email</th>
              <th className="!text-center">Telepon</th>
              <th>Bergabung</th>
              <th className="pr-6 !text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j}><div className="skeleton h-4 rounded" /></td>
                ))}</tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted text-sm">
                  Tidak ada pelanggan ditemukan
                </td>
              </tr>
            ) : customers.map((c) => (
              <tr key={c.id} id={`customer-row-${c.id}`}>
                <td className="pl-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0" style={{ color: "var(--color-canvas)" }}>
                      <span className="text-xs font-medium">{c.name[0]?.toUpperCase()}</span>
                    </div>
                    <span className="font-medium text-ink text-sm">{c.name}</span>
                  </div>
                </td>
                <td className="text-sm text-body">{c.email || "-"}</td>
                <td className="text-sm text-body text-center">{c.phone || "-"}</td>
                <td className="text-xs text-muted">
                  {new Date(c.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="pr-6">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      id={`delete-customer-${c.id}`}
                      className="admin-btn-danger h-7 px-3 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {/* Filler rows untuk menjaga tinggi tabel tetap konsisten */}
            {!loading && customers.length > 0 && customers.length < 15 && Array.from({ length: 15 - customers.length }).map((_, i) => (
              <tr key={`filler-${i}`} style={{ borderBottomColor: "transparent" }}>
                <td className="pl-6 py-3.5"><div className="h-8"></div></td>
                <td colSpan={4}></td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-hairline flex items-center justify-center gap-1.5 bg-canvas-soft/30 mt-auto">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  p === page ? "" : "text-muted hover:bg-canvas-soft border border-hairline"
                }`}
                style={p === page ? { backgroundColor: "var(--color-ink)", color: "var(--color-canvas)" } : {}}
              >{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <CustomerModal onClose={() => setShowForm(false)} onSuccess={load} />
      )}
    </div>
  );
}
