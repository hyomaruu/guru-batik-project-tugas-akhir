"use client";
import { useState, useEffect } from "react";
import { adminRFMApi } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import { exportToPDF } from "@/lib/pdf";
import {
  Chart as ChartJS, ScatterController, PointElement, LinearScale,
  Tooltip, Legend,
} from "chart.js";
import dynamic from "next/dynamic";
const Scatter = dynamic(() => import("react-chartjs-2").then(mod => mod.Scatter), { ssr: false });

ChartJS.register(ScatterController, PointElement, LinearScale, Tooltip, Legend);

const CLUSTER_COLORS = [
  "#171717", "#0070f3", "#7928ca", "#f5a623", "#50e3c2",
  "#ff0080", "#ee0000", "#4d4d4d", "#29bc9b", "#0761d1",
];

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "priority-high",
  MEDIUM: "priority-medium",
  LOW:    "priority-low",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

export default function KMeansPage() {
  const [kValue, setKValue] = useState(3);
  const [running, setRunning] = useState(false);
  const [runData, setRunData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCluster, setActiveCluster] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    adminRFMApi.getClusterResults()
      .then((r) => {
        setRunData(r.data?.run || null);
        setResults(r.data?.results || []);
        setSummary(r.data?.summary || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRunKMeans() {
    setRunning(true);
    try {
      const res = await adminRFMApi.runKMeans(kValue);
      toast.success(res.message || "K-Means selesai!");
      // Reload results
      const r2 = await adminRFMApi.getClusterResults(res.data?.run_id);
      setRunData(r2.data?.run || null);
      setResults(r2.data?.results || []);
      setSummary(r2.data?.summary || []);
      setPage(1); // Reset page on new run
    } catch (err: any) {
      toast.error(err.message || "Gagal menjalankan K-Means. Pastikan RFM sudah dihitung.");
    } finally {
      setRunning(false);
    }
  }

  async function handleExportPDF() {
    if (results.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    const filtered = results.filter((r) => activeCluster === null || r.cluster_label === activeCluster);
    if (filtered.length === 0) {
      toast.error("Tidak ada data dalam cluster terpilih");
      return;
    }
    
    const columns = ["Pelanggan", "Cluster", "Prioritas", "Recency", "Frequency", "Monetary"];
    const data = filtered.map((r: any) => [
      r.customer_name || "-",
      `${r.cluster_name} (Label: ${r.cluster_label})`,
      r.priority_level,
      `${r.recency} hari`,
      `${r.frequency}x`,
      formatCurrency(r.monetary)
    ]);

    await exportToPDF({
      title: "Laporan K-Means Clustering",
      columns,
      data,
      filename: "Laporan_KMeans_Clustering.pdf",
    });
  }

  // Build scatter chart data per cluster
  const scatterData = {
    datasets: results.length > 0
      ? Array.from(new Set(results.map((r) => r.cluster_label))).sort().map((label) => {
          const clusterResults = results.filter((r) => r.cluster_label === label);
          const clusterName = clusterResults[0]?.cluster_name || `Cluster ${label}`;
          
          let color = CLUSTER_COLORS[label % CLUSTER_COLORS.length];
          if (isDark && color === "#171717") color = "#ffffff";

          return {
            label: clusterName,
            data: clusterResults.map((r) => ({ x: r.pca_x, y: r.pca_y })),
            backgroundColor: color + "CC",
            borderColor: color,
            pointRadius: activeCluster === null || activeCluster === label ? 7 : 3,
            pointHoverRadius: 10,
          };
        })
      : [],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } },
        onClick: (_: any, item: any) => {
          setActiveCluster(prev => {
            setPage(1); // Reset page when filtering
            return prev === item.datasetIndex ? null : item.datasetIndex;
          });
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const pt = results.filter((r) => r.cluster_label === ctx.datasetIndex)[ctx.dataIndex];
            if (!pt) return ctx.dataset.label;
            return [`${ctx.dataset.label}`, `${pt.customer_name}`, `R=${pt.recency}d F=${pt.frequency}x M=${formatCurrency(pt.monetary)}`];
          },
        },
      },
    },
    scales: {
      x: { grid: { color: isDark ? "#333333" : "#ebebeb" }, ticks: { font: { size: 11 }, color: isDark ? "#a0a0a0" : "#888888" }, title: { display: true, text: "PCA Dimensi 1", font: { size: 11 }, color: isDark ? "#a0a0a0" : "#888888" } },
      y: { grid: { color: isDark ? "#333333" : "#ebebeb" }, ticks: { font: { size: 11 }, color: isDark ? "#a0a0a0" : "#888888" }, title: { display: true, text: "PCA Dimensi 2", font: { size: 11 }, color: isDark ? "#a0a0a0" : "#888888" } },
    },
  };

  return (
    <div className="space-y-5 animate-slide-up" id="kmeans-page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">K-Means Clustering</h2>
          <p className="text-sm text-muted mt-0.5">
            Segmentasi otomatis berbasis data RFM — pilih jumlah cluster lalu jalankan analisis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {results.length > 0 && (
            <button
              onClick={handleExportPDF}
              className="admin-btn-secondary flex-1 sm:flex-none justify-center"
              id="btn-export-pdf-kmeans"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="admin-card p-5 flex flex-col sm:flex-row items-center gap-6" id="kmeans-controls">
        {/* Slider section */}
        <div className="flex flex-col gap-3 flex-1 w-full min-w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted" style={{fontFamily:"var(--font-mono)"}}>
              JUMLAH CLUSTER (k)
            </span>
            <span className="text-3xl font-bold text-ink leading-none tabular-nums" style={{fontFamily:"var(--font-mono)"}}>
              {kValue}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-mono">2</span>
            <input
              id="k-slider"
              type="range"
              min={2}
              max={8}
              step={1}
              value={kValue}
              onChange={(e) => setKValue(+e.target.value)}
              className="admin-range-slider flex-1"
            />
            <span className="text-xs text-muted font-mono">8</span>
          </div>
          {/* Tick marks */}
          <div className="flex justify-between px-5">
            {[2,3,4,5,6,7,8].map((v) => (
              <button
                key={v}
                onClick={() => setKValue(v)}
                className={`text-xs font-mono transition-all ${
                  v === kValue
                    ? "text-ink font-bold scale-110"
                    : "text-muted hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-16 bg-hairline hidden sm:block" />

        {/* Action buttons */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <button
            onClick={handleRunKMeans}
            disabled={running}
            id="btn-run-kmeans"
            className="admin-btn-primary w-full sm:w-auto h-12 px-6"
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Jalankan K-Means
              </>
            )}
          </button>
        </div>
      </div>


      {/* Run metadata */}
      {runData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="run-metadata">
          {[
            { label: "RUN ID", value: runData.id?.slice(0, 8) + "..." },
            { label: "K VALUE", value: runData.k_value },
            { label: "INERTIA", value: runData.inertia?.toFixed(2) },
            { label: "SILHOUETTE", value: runData.silhouette?.toFixed(3) },
          ].map((m) => (
            <div key={m.label} className="px-3 py-2 rounded-md bg-canvas-soft border border-hairline">
              <p className="mono-caption mb-0.5">{m.label}</p>
              <p className="text-sm font-semibold text-ink">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !loading ? (
        <div className="empty-state">
          <svg className="w-12 h-12 text-hairline mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          </svg>
          <p className="text-sm font-medium text-ink">Belum ada hasil clustering</p>
          <p className="text-sm text-muted mt-1 max-w-xs">
            Pastikan RFM sudah dihitung terlebih dahulu, lalu klik Jalankan K-Means.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* ─── Scatter Plot ─── */}
          <div className="lg:col-span-3 admin-card" id="scatter-plot">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Visualisasi Cluster (PCA 2D)</p>
              <span className="mono-caption text-muted/70">Klik legenda untuk highlight</span>
            </div>
            {results.length > 0 ? (
              <Scatter data={scatterData} options={scatterOptions as any} />
            ) : (
              <div className="skeleton h-64 rounded" />
            )}
          </div>

          {/* ─── Cluster Summary Cards ─── */}
          <div className="lg:col-span-2 space-y-3" id="cluster-summary">
            <p className="text-sm font-semibold text-ink">Ringkasan Cluster & Prioritas</p>
            {loading ? (
              Array.from({ length: kValue }).map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))
            ) : summary.map((s: any) => (
              <div
                key={s.cluster_label}
                id={`cluster-card-${s.cluster_label}`}
                className={`admin-card cursor-pointer transition-all duration-200 ${
                  activeCluster === s.cluster_label ? "ring-2 ring-ink" : ""
                }`}
                onClick={() => {
                  setActiveCluster(prev => prev === s.cluster_label ? null : s.cluster_label);
                  setPage(1); // Reset page when filtering
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CLUSTER_COLORS[s.cluster_label % CLUSTER_COLORS.length] }}
                    />
                    <span className="text-sm font-semibold text-ink">{s.cluster_name}</span>
                  </div>
                  <span className={PRIORITY_STYLES[s.priority_level] || "priority-medium"}>
                    {s.priority_level}
                  </span>
                </div>
                <p className="text-xs text-muted mb-2">{s.count} pelanggan</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted">Avg Recency</p>
                    <p className="font-medium text-body">{s.avg_recency?.toFixed(0)} hari</p>
                  </div>
                  <div>
                    <p className="text-muted">Avg Freq</p>
                    <p className="font-medium text-body">{s.avg_frequency?.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p className="text-muted">Avg Monetary</p>
                    <p className="font-medium text-body">{formatCurrency(s.avg_monetary)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tabel Detail per Pelanggan ─── */}
      {results.length > 0 && (
        <>
        <div className="admin-card p-0 overflow-hidden" id="cluster-detail-table">
          <div className="px-6 py-4 border-b border-hairline flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Detail Pelanggan per Cluster</p>
            {activeCluster !== null && (
              <button
                onClick={() => { setActiveCluster(null); setPage(1); }}
                className="text-xs text-link hover:text-link-deep font-medium"
              >
                ✕ Hapus Filter
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="pl-6">Pelanggan</th>
                  <th>Cluster</th>
                  <th>Prioritas</th>
                  <th>Recency</th>
                  <th>Frequency</th>
                  <th className="pr-6">Monetary</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = results.filter((r) => activeCluster === null || r.cluster_label === activeCluster);
                  const startIndex = (page - 1) * limit;
                  const paginated = filtered.slice(startIndex, startIndex + limit);
                  return paginated.map((r) => (
                    <tr key={r.customer_id} id={`cluster-detail-${r.customer_id}`}>
                      <td className="pl-6">
                        <p className="font-medium text-ink text-sm">{r.customer_name}</p>
                        <p className="text-xs text-muted">{r.email}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CLUSTER_COLORS[r.cluster_label % CLUSTER_COLORS.length] }}
                          />
                          <span className="text-sm text-body">{r.cluster_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={PRIORITY_STYLES[r.priority_level] || "priority-medium"}>
                          {r.priority_level}
                        </span>
                      </td>
                      <td className="text-sm text-body">{r.recency} hari</td>
                      <td className="text-sm text-body">{r.frequency}x</td>
                      <td className="pr-6 text-sm text-body">{formatCurrency(r.monetary)}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {(() => {
          const filteredTotal = results.filter((r) => activeCluster === null || r.cluster_label === activeCluster).length;
          const totalPages = Math.ceil(filteredTotal / limit);
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="admin-btn-secondary h-8 px-3 text-xs disabled:opacity-40"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    p === page
                      ? "bg-ink text-canvas shadow-sm"
                      : "text-muted hover:text-ink border border-hairline"
                  }`}
                >{p}</button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="admin-btn-secondary h-8 px-3 text-xs disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          );
        })()}
      </>
      )}

      {/* Penjelasan */}
      <div className="admin-card-soft text-xs text-muted space-y-2" id="kmeans-explanation">
        <p className="font-semibold text-body">Cara Kerja K-Means di Sistem Ini</p>
        <p>1. Data RFM (Recency, Frequency, Monetary) dinormalisasi menggunakan <span className="font-mono bg-canvas-soft-2 px-1 rounded">StandardScaler</span>.</p>
        <p>2. Algoritma <span className="font-mono bg-canvas-soft-2 px-1 rounded">KMeans(init=&quot;k-means++&quot;, n_init=10)</span> dijalankan untuk membagi pelanggan ke dalam k kelompok.</p>
        <p>3. Visualisasi 2D dibuat menggunakan <span className="font-mono bg-canvas-soft-2 px-1 rounded">PCA(n_components=2)</span> untuk proyeksi scatter plot.</p>
        <p>4. Prioritas cluster ditentukan berdasarkan composite score: R×35% + F×35% + M×30%.</p>
        <p>5. Metrik kualitas: <strong>Inertia</strong> (semakin kecil semakin baik) dan <strong>Silhouette Score</strong> (mendekati 1 = cluster sangat terpisah).</p>
      </div>
    </div>
  );
}
