"use client";
import { useEffect, useState } from "react";
import { adminCustomerApi, adminArticleApi } from "@/lib/api";
import Link from "next/link";
import { 
  Users, CreditCard, Wallet, Activity, 
  FileText, UserCog, Calculator, BrainCircuit, ChevronRight 
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
}

function StatCard({ label, value, sub, icon, color }: any) {
  return (
    <div className="admin-stat-card" id={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-ink mb-0.5">{value}</p>
      <p className="text-sm text-body">{label}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    Promise.all([
      adminCustomerApi.stats(),
      adminArticleApi.list({ limit: "5", page: "1" }),
    ]).then(([s, a]) => {
      setStats(s.data);
      setArticles(a.data?.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.monthly_data ? {
    labels: stats.monthly_data.map((d: any) => {
      const [y, m] = d.month.split("-");
      return new Date(+y, +m - 1).toLocaleDateString("id-ID", { month: "short" });
    }),
    datasets: [
      {
        label: "Pendapatan (Rp)",
        data: stats.monthly_data.map((d: any) => d.revenue),
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(23, 23, 23, 0.85)",
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatCurrency(ctx.raw),
        },
      },
    },
    scales: {
      y: {
        grid: { color: isDark ? "#333333" : "#ebebeb" },
        ticks: {
          callback: (v: any) => "Rp " + (v / 1000000).toFixed(0) + "jt",
          font: { size: 11, family: "JetBrains Mono, monospace" },
          color: isDark ? "#a0a0a0" : "#888888",
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: isDark ? "#a0a0a0" : "#888888" },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-stat-card"><div className="skeleton h-20 rounded" /></div>
          ))}
        </div>
        <div className="skeleton h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up" id="admin-dashboard">
      {/* Page title */}
      <div>
        <h2 className="text-base font-semibold text-ink">Ringkasan Sistem</h2>
        <p className="text-sm text-muted">Data terkini dari seluruh modul UMKM Guru Batik.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards">
        <StatCard
          label="Total Pelanggan"
          value={stats?.total_customers?.toLocaleString("id-ID") ?? "-"}
          icon={<Users className="w-5 h-5" />}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Total Transaksi"
          value={stats?.total_transactions?.toLocaleString("id-ID") ?? "-"}
          icon={<CreditCard className="w-5 h-5" />}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Total Pendapatan"
          value={stats?.total_revenue ? formatCurrency(stats.total_revenue) : "-"}
          icon={<Wallet className="w-5 h-5" />}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Rata-rata Transaksi"
          value={stats?.avg_transaction ? formatCurrency(stats.avg_transaction) : "-"}
          icon={<Activity className="w-5 h-5" />}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Chart + Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 admin-card" id="revenue-chart">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-ink">Pendapatan Bulanan</p>
              <p className="text-xs text-muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                6 bulan terakhir
              </p>
            </div>
          </div>
          {chartData ? (
            <Bar data={chartData} options={chartOptions as any} height={120} />
          ) : (
            <div className="empty-state min-h-[120px]">
              <p className="text-sm text-muted">Belum ada data transaksi.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="admin-card" id="quick-actions">
          <p className="text-sm font-semibold text-ink mb-4">Aksi Cepat</p>
          <div className="space-y-2">
            {[
              { 
                href: "/admin/berita/baru", 
                label: "Tulis Artikel Baru", 
                icon: <FileText className="w-4 h-4" /> 
              },
              { 
                href: "/admin/pelanggan", 
                label: "Kelola Pelanggan", 
                icon: <UserCog className="w-4 h-4" /> 
              },
              { 
                href: "/admin/segmentasi/rfm", 
                label: "Hitung RFM", 
                icon: <Calculator className="w-4 h-4" /> 
              },
              { 
                href: "/admin/segmentasi/kmeans", 
                label: "Jalankan K-Means", 
                icon: <BrainCircuit className="w-4 h-4" /> 
              },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                id={`quick-action-${a.label.toLowerCase().replace(/ /g, "-")}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-canvas-soft transition-colors group"
              >
                <span className="text-muted group-hover:text-ink transition-colors flex items-center justify-center">
                  {a.icon}
                </span>
                <span className="text-sm text-body group-hover:text-ink transition-colors">{a.label}</span>
                <ChevronRight className="w-4 h-4 text-muted ml-auto group-hover:text-ink transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="admin-card" id="recent-articles-table">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink">Artikel Terbaru</p>
          <Link href="/admin/berita" className="text-xs text-link hover:text-link-deep transition-colors">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table w-full min-w-[600px]">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-muted py-8">Belum ada artikel.</td></tr>
              ) : articles.map((a: any) => (
                <tr key={a.id}>
                  <td className="font-medium text-ink max-w-xs truncate">{a.title}</td>
                  <td><span className="admin-badge admin-badge-neutral">{a.category}</span></td>
                  <td>
                    {a.is_published
                      ? <span className="admin-badge admin-badge-success">Dipublikasikan</span>
                      : <span className="admin-badge admin-badge-warning">Draft</span>}
                  </td>
                  <td className="text-muted text-xs">
                    {new Date(a.created_at).toLocaleDateString("id-ID")}
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
