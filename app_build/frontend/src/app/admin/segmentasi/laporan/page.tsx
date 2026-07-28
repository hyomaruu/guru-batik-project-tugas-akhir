"use client";
import { useState, useEffect, useRef } from "react";
import { adminRFMApi } from "@/lib/api";
import { addLetterhead } from "@/lib/pdf";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, Title, Tooltip, Legend);

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

const CLUSTER_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#171717"];
const SEGMENT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"];

export default function ComprehensiveReportPage() {
  const [rfmStats, setRfmStats] = useState<any>(null);
  const [rfmSegments, setRfmSegments] = useState<any[]>([]);
  
  const [kmeansSummary, setKmeansSummary] = useState<any[]>([]);
  const [kmeansResults, setKmeansResults] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const rfmChartRef = useRef<any>(null);
  const kmeansChartRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      adminRFMApi.getResults({ limit: "10" }), // we only need segment_summary and stats
      adminRFMApi.getClusterResults()
    ]).then(([rfmRes, kmeansRes]) => {
      setRfmStats(rfmRes.data?.stats);
      setRfmSegments(rfmRes.data?.segment_summary || []);
      
      setKmeansSummary(kmeansRes.data?.summary || []);
      setKmeansResults(kmeansRes.data?.results || []);
    }).catch((err) => {
      toast.error("Gagal memuat data laporan");
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    const t = toast.loading("Menghasilkan Laporan PDF...");
    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4"
      });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();

      // PAGE 1: RFM
      await addLetterhead(doc);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN KOMPREHENSIF ANALISIS RFM", pageWidth / 2, 45, { align: "center" });

      if (rfmStats) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Rata-rata Recency: ${rfmStats.avg_recency} hari`, 14, 55);
        doc.text(`Rata-rata Frequency: ${rfmStats.avg_frequency}x`, 14, 61);
        doc.text(`Rata-rata Monetary: ${formatCurrency(rfmStats.avg_monetary)}`, 14, 67);
      }

      let nextY = 75;

      // Add RFM Chart
      if (rfmChartRef.current) {
        const canvas = rfmChartRef.current.canvas || rfmChartRef.current.chartInstance?.canvas;
        if (canvas) {
          const rfmImg = canvas.toDataURL("image/png", 1.0);
          doc.addImage(rfmImg, "PNG", 14, nextY, 180, 70);
          nextY += 75;
        }
      }

      // Add RFM Table
      if (rfmSegments.length > 0) {
        autoTable(doc, {
          startY: nextY,
          head: [["Segmen", "Jumlah Pelanggan"]],
          body: rfmSegments.map(s => [s.segment, s.count.toString()]),
          styles: { fontSize: 9, font: "helvetica" },
          headStyles: { fillColor: [30, 41, 59] },
          margin: { left: 14, right: 14, bottom: 40 }
        });
      }

      // PAGE 2: K-MEANS
      doc.addPage();
      await addLetterhead(doc);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN HASIL K-MEANS CLUSTERING", pageWidth / 2, 45, { align: "center" });

      nextY = 55;

      // Add K-Means Chart
      if (kmeansChartRef.current) {
        const canvas = kmeansChartRef.current.canvas || kmeansChartRef.current.chartInstance?.canvas;
        if (canvas) {
          const kmeansImg = canvas.toDataURL("image/png", 1.0);
          doc.addImage(kmeansImg, "PNG", 14, nextY, 180, 80);
          nextY += 85;
        }
      }

      // Add K-Means Table
      if (kmeansSummary.length > 0) {
        autoTable(doc, {
          startY: nextY,
          head: [["Cluster", "Nama", "Label / Prioritas", "Pelanggan", "Rata-rata RFM"]],
          body: kmeansSummary.map(s => [
            s.cluster_label?.toString() || "-",
            s.cluster_name || "-",
            `${s.priority_label || "-"} (${s.priority_level || "-"})`,
            (s.count || 0).toString(),
            `${s.avg_recency?.toFixed(0) || 0}h | ${s.avg_frequency?.toFixed(1) || 0}x | ${formatCurrency(s.avg_monetary || 0)}`
          ]),
          styles: { fontSize: 9, font: "helvetica" },
          headStyles: { fillColor: [30, 41, 59] },
          margin: { left: 14, right: 14, bottom: 40 }
        });
      }

      // SIGNATURE (pojok bawah kanan)
      const signatureY = pageHeight - 40;

      const rightCenter = pageWidth - 40;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sleman, Kamis, 23 Juli 2026", rightCenter, signatureY, { align: "center" });
      doc.text("Pemilik Usaha Guru Batik,", rightCenter, signatureY + 6, { align: "center" });
      
      doc.text("( .................................................... )", rightCenter, signatureY + 30, { align: "center" });

      doc.save("Laporan_Lengkap_Segmentasi.pdf");
      toast.success("Berhasil mengunduh laporan!", { id: t });
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat PDF", { id: t });
    } finally {
      setExporting(false);
    }
  };

  const rfmChartData = {
    labels: rfmSegments.map(s => s.segment),
    datasets: [{
      label: "Jumlah Pelanggan",
      data: rfmSegments.map(s => s.count),
      backgroundColor: SEGMENT_COLORS.slice(0, rfmSegments.length),
    }]
  };

  const kmeansScatterData = {
    datasets: kmeansResults.length > 0 
      ? Array.from(new Set(kmeansResults.map(r => r.cluster_label))).sort().map(label => {
          const clusterResults = kmeansResults.filter(r => r.cluster_label === label);
          const color = CLUSTER_COLORS[label % CLUSTER_COLORS.length];
          return {
            label: `Cluster ${label}`,
            data: clusterResults.map(r => ({ x: r.pca_x, y: r.pca_y })),
            backgroundColor: color + "CC",
            borderColor: color,
            pointRadius: 4,
          };
        })
      : []
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-ink">Laporan Lengkap Segmentasi</h2>
          <p className="text-sm text-muted mt-0.5">
            Rangkuman analisis RFM dan K-Means Clustering dalam satu tampilan.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || (rfmSegments.length === 0 && kmeansSummary.length === 0)}
          className="admin-btn-primary"
        >
          {exporting ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyusun PDF...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>Cetak Laporan Lengkap</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="font-semibold text-ink mb-4">Distribusi Segmen RFM</h3>
          {rfmSegments.length > 0 ? (
            <div className="w-full bg-white rounded-lg p-2">
              <Bar ref={rfmChartRef} data={rfmChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={150} />
            </div>
          ) : (
            <p className="text-sm text-muted">Belum ada data RFM.</p>
          )}
        </div>

        <div className="admin-card">
          <h3 className="font-semibold text-ink mb-4">Persebaran Cluster (K-Means)</h3>
          {kmeansResults.length > 0 ? (
            <div className="w-full bg-white rounded-lg p-2">
              <Scatter ref={kmeansChartRef} data={kmeansScatterData} options={{ responsive: true }} height={150} />
            </div>
          ) : (
            <p className="text-sm text-muted">Belum ada data K-Means.</p>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h3 className="font-semibold text-ink mb-4">Ringkasan Cluster K-Means</h3>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cluster</th>
                <th>Prioritas</th>
                <th>Pelanggan</th>
                <th>Rata-rata RFM</th>
              </tr>
            </thead>
            <tbody>
              {kmeansSummary.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">Belum ada hasil clustering.</td></tr>
              ) : kmeansSummary.map((s) => (
                <tr key={s.cluster_label}>
                  <td className="font-medium text-ink">{s.cluster_name || `Cluster ${s.cluster_label}`}</td>
                  <td><span className="admin-badge admin-badge-neutral">{s.priority_label} (Lv {s.priority_level})</span></td>
                  <td>{s.count || 0} orang</td>
                  <td className="text-muted text-xs">
                    R={s.avg_recency?.toFixed(0)}h | F={s.avg_frequency?.toFixed(1)}x | M={formatCurrency(s.avg_monetary || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
