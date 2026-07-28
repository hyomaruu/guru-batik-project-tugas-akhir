"use client";
import { useState, useEffect, useCallback } from "react";
import { adminTransactionApi, adminCustomerApi } from "@/lib/api";
import type { Transaction, PaginatedData, Customer } from "@/lib/types";
import toast, { Toaster } from "react-hot-toast";
import { exportToPDF } from "@/lib/pdf";
import EditTransactionModal from "@/components/admin/EditTransactionModal";
import TransactionModal from "@/components/admin/TransactionModal";
import { FileDown, Plus, Edit } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

export default function AdminTransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [showTxForm, setShowTxForm] = useState(false);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    adminCustomerApi.list({ limit: "1000" })
      .then(r => setAllCustomers(r.data?.data || []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "15" };
    adminTransactionApi.list(params)
      .then((r) => {
        const paged = r.data as PaginatedData<Transaction>;
        setTransactions(paged.data ?? []);
        setTotal(paged.total ?? 0);
        setTotalPages(paged.total_pages ?? 1);
      })
      .catch(() => toast.error("Gagal memuat transaksi"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleExportPDF() {
    if (total === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    
    const loadingToast = toast.loading("Menyiapkan PDF...");
    try {
      const res = await adminTransactionApi.list({ limit: "10000" });
      const allTransactions = res.data?.data || [];
      
      await exportToPDF({
        title: "Laporan Transaksi",
        columns: ["Tanggal", "Pelanggan", "Keterangan", "Jumlah (Rp)"],
        data: allTransactions.map((t) => [
          new Date(t.transaction_date).toLocaleDateString("id-ID"),
          t.customer?.name ?? "Pelanggan Terhapus",
          t.description || "-",
          formatCurrency(t.amount),
        ]),
        filename: "Laporan_Transaksi.pdf",
      });
      toast.success("Berhasil didownload", { id: loadingToast });
    } catch (e) {
      toast.error("Gagal membuat PDF", { id: loadingToast });
    }
  }

  return (
    <div className="space-y-5 animate-slide-up" id="admin-transaksi-page">
      {/* Tabel Transaksi */}
      <div className="admin-card p-0 flex flex-col overflow-x-auto">
        <div className="p-4 border-b border-hairline flex flex-wrap items-center justify-between gap-4 bg-canvas-soft/30">
          <div>
            <h2 className="text-base font-semibold text-ink">Manajemen Transaksi</h2>
            <p className="text-sm text-muted mt-0.5">
              Total: <span className="font-semibold text-ink">{total}</span> transaksi tercatat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportPDF} className="admin-btn-secondary" id="btn-export-pdf-transaksi">
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>
            <button onClick={() => setShowTxForm(true)} className="admin-btn-primary" id="btn-add-transaction">
              <Plus className="w-4 h-4" />
              Transaksi
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="admin-table" id="transactions-table">
          <thead>
            <tr>
              <th className="pl-6">Tanggal</th>
              <th>Pelanggan</th>
              <th>Keterangan</th>
              <th className="!text-center">Jumlah (Rp)</th>
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
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted text-sm">
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            ) : transactions.map((t) => (
              <tr key={t.id} id={`transaction-row-${t.id}`}>
                <td className="pl-6 text-sm text-body">
                  {new Date(t.transaction_date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </td>
                <td className="text-sm font-medium text-ink">
                  {t.customer?.name ?? "Pelanggan Terhapus"}
                </td>
                <td className="text-sm text-muted">{t.description || "-"}</td>
                <td className="text-center font-medium text-ink">{formatCurrency(t.amount)}</td>
                <td className="pr-6">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => setEditTarget(t)}
                      className="admin-btn-secondary h-7 px-3 text-xs"
                      id={`edit-transaction-${t.id}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {/* Filler rows untuk menjaga tinggi tabel tetap konsisten */}
            {!loading && transactions.length > 0 && transactions.length < 15 && Array.from({ length: 15 - transactions.length }).map((_, i) => (
              <tr key={`filler-${i}`} style={{ borderBottomColor: "transparent" }}>
                <td className="pl-6 py-3.5"><div className="h-5"></div></td>
                <td colSpan={4}></td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-hairline flex flex-wrap items-center justify-center gap-1.5 bg-canvas-soft/30 mt-auto">
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

      {/* Modal Edit */}
      {editTarget && (
        <EditTransactionModal
          transaction={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={load}
        />
      )}
      {/* Modal Tambah Transaksi */}
      {showTxForm && (
        <TransactionModal
          customers={allCustomers}
          onClose={() => setShowTxForm(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
