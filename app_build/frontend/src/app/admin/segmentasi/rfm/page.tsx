"use client";
import { useState, useEffect, useCallback } from "react";
import { adminRFMApi } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import { exportToPDF } from "@/lib/pdf";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

const SEGMENT_COLORS: Record<string, string> = {
  Champions:          "bg-blue-600 text-white",
  "Loyal Customers":  "bg-blue-500 text-white",
  "Potential Loyalists": "bg-blue-400 text-white",
  "Recent Customers": "bg-emerald-500 text-white",
  "At Risk":          "bg-amber-500 text-white",
  "Can't Lose Them":  "bg-red-500 text-white",
  Hibernating:        "bg-slate-500 text-white",
  "Need Attention":   "bg-amber-400 text-white",
};

export default function RFMPage() {
  const [results, setResults] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [segmentFilter, setSegmentFilter] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadResults = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "20" };
    if (segmentFilter) params.segment = segmentFilter;
    adminRFMApi.getResults(params)
      .then((r) => {
        setResults(r.data?.results || []);
        setSegments(r.data?.segment_summary || []);
        setStats(r.data?.stats || null);
        setTotal(r.data?.total || 0);
        setHasData((r.data?.results?.length || 0) > 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, segmentFilter]);

  useEffect(() => { loadResults(); }, [loadResults]);

  async function handleCalculate() {
    setCalculating(true);
    try {
      const res = await adminRFMApi.calculate();
      toast.success(res.message || "RFM berhasil dihitung!");
      setPage(1);
      setSegmentFilter("");
      loadResults();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghitung RFM");
    } finally {
      setCalculating(false);
    }
  }

  function ScoreDot({ score }: { score: number }) {
    const dots = Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`w-2 h-2 rounded-full inline-block ${i < score ? "bg-ink" : "bg-hairline"}`} />
    ));
    return <span className="flex gap-0.5 items-center">{dots}</span>;
  }

  async function handleExportPDF() {
    if (total === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    const loadingToast = toast.loading("Menyiapkan PDF...");
    try {
      const res = await adminRFMApi.getResults({ limit: "10000", segment: segmentFilter });
      const allResults = res.data?.results || [];

      const columns = ["Pelanggan", "Recency", "Frequency", "Monetary", "Total", "Segmen"];
      const data = allResults.map((r: any) => [
        r.customer_name || "-",
        `${r.recency} hari`,
        `${r.frequency}x`,
        formatCurrency(r.monetary),
        r.rfm_total,
        r.segment_label
      ]);

      await exportToPDF({
        title: "Laporan Segmentasi RFM",
        columns,
        data,
        filename: "Laporan_Segmentasi_RFM.pdf",
      });
      toast.success("Berhasil didownload", { id: loadingToast });
    } catch (e) {
      toast.error("Gagal membuat PDF", { id: loadingToast });
    }
  }

  return (
    <div className="space-y-5 animate-slide-up" id="rfm-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Analisis RFM</h2>
          <p className="text-sm text-muted mt-0.5">
            Recency · Frequency · Monetary — Kalkulasi scoring quintile (1–5) dari data transaksi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {hasData && !loading && (
            <button
              onClick={handleExportPDF}
              className="admin-btn-secondary flex-1 sm:flex-none justify-center"
              id="btn-export-pdf-rfm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          )}
          <button
            onClick={handleCalculate}
            disabled={calculating}
            id="btn-calculate-rfm"
            className="admin-btn-primary"
          >
            {calculating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menghitung...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>Hitung RFM Sekarang</>
            )}
          </button>
        </div>
      </div>

      {/* Rata-rata stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="rfm-stats">
          {[
            { label: "Rata-rata Recency", value: `${stats.avg_recency} hari`, desc: "Hari sejak transaksi terakhir" },
            { label: "Rata-rata Frequency", value: `${stats.avg_frequency}x`, desc: "Jumlah transaksi rata-rata" },
            { label: "Rata-rata Monetary", value: formatCurrency(stats.avg_monetary), desc: "Total nilai per pelanggan" },
          ].map((s) => (
            <div key={s.label} className="admin-card">
              <p className="mono-caption mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-ink">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Segment Summary chips */}
      {segments.length > 0 && (
        <div className="admin-card" id="segment-summary">
          <p className="text-sm font-semibold text-ink mb-3">Distribusi Segmen</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSegmentFilter(""); setPage(1); }}
              className={`admin-badge cursor-pointer ${!segmentFilter ? "bg-ink text-canvas" : "admin-badge-neutral"}`}
            >
              Semua ({total})
            </button>
            {segments.map((s: any) => (
              <button
                key={s.segment}
                id={`filter-segment-${s.segment}`}
                onClick={() => { setSegmentFilter(s.segment); setPage(1); }}
                className={`admin-badge cursor-pointer transition-all ${
                  segmentFilter === s.segment ? "bg-ink text-canvas" : "admin-badge-neutral"
                }`}
              >
                {s.segment} <span className="ml-1 opacity-70">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabel RFM */}
      {!hasData && !loading ? (
        <div className="empty-state">
          <svg className="w-12 h-12 text-hairline mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium text-ink">Belum ada data RFM</p>
          <p className="text-sm text-muted mt-1">Klik &quot;Hitung RFM Sekarang&quot; untuk memulai analisis.</p>
        </div>
      ) : (
        <div className="admin-card p-0 overflow-hidden" id="rfm-table-container">
          <div className="overflow-x-auto">
            <table className="admin-table" id="rfm-table">
              <thead>
                <tr>
                  <th className="pl-6">Pelanggan</th>
                  <th>Recency <span className="text-muted/60">(hari)</span></th>
                  <th>Frequency</th>
                  <th>Monetary</th>
                  <th>R</th>
                  <th>F</th>
                  <th>M</th>
                  <th>Total</th>
                  <th className="pr-6">Segmen</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}</tr>
                  ))
                ) : results.map((r: any) => (
                  <tr key={r.customer_id} id={`rfm-row-${r.customer_id}`}>
                    <td className="pl-6">
                      <p className="font-medium text-ink text-sm">{r.customer_name}</p>
                      <p className="text-xs text-muted">{r.email}</p>
                    </td>
                    <td className="text-sm text-body">{r.recency}</td>
                    <td className="text-sm text-body">{r.frequency}x</td>
                    <td className="text-sm text-body">{formatCurrency(r.monetary)}</td>
                    <td><ScoreDot score={r.r_score} /></td>
                    <td><ScoreDot score={r.f_score} /></td>
                    <td><ScoreDot score={r.m_score} /></td>
                    <td>
                      <span className="font-mono text-sm font-semibold text-ink">{r.rfm_total}</span>
                    </td>
                    <td className="pr-6">
                      <span className={`admin-badge text-xs ${SEGMENT_COLORS[r.segment_label] || "admin-badge-neutral"}`}>
                        {r.segment_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination inside card */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-1.5 p-4 border-t border-hairline">
              {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    p === page ? "bg-ink text-canvas" : "text-muted hover:bg-canvas-soft border border-hairline"
                  }`}
                >{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Penjelasan RFM */}
      <div className="admin-card-soft" id="rfm-explanation">
        <p className="text-xs font-semibold text-ink mb-3">Cara Baca Tabel RFM</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted">
          <div>
            <p className="font-medium text-body mb-1">R — Recency</p>
            <p>Skor 5 = baru beli. Skor 1 = sudah lama tidak beli. Dihitung dari hari terakhir transaksi.</p>
          </div>
          <div>
            <p className="font-medium text-body mb-1">F — Frequency</p>
            <p>Skor 5 = paling sering beli. Dihitung dari total jumlah transaksi pelanggan.</p>
          </div>
          <div>
            <p className="font-medium text-body mb-1">M — Monetary</p>
            <p>Skor 5 = total nilai transaksi tertinggi. Dihitung dari SUM semua transaksi pelanggan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
