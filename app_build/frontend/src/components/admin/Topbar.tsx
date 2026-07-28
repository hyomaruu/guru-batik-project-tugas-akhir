"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/berita": "Manajemen Berita",
  "/admin/pelanggan": "Manajemen Pelanggan",
  "/admin/transaksi": "Manajemen Transaksi",
  "/admin/segmentasi/rfm": "Analisis RFM",
  "/admin/segmentasi/kmeans": "K-Means Clustering",
};

export default function AdminTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const pathname = usePathname();
  const [username, setUsername] = useState("Admin");
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateUsername = () => {
      const u = localStorage.getItem("gb_username");
      if (u) setUsername(u);
    };
    updateUsername();

    // Listen to custom event for dynamic updates
    window.addEventListener("gb_username_updated", updateUsername);

    const tick = () => {
      setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 60000);

    return () => {
      clearInterval(id);
      window.removeEventListener("gb_username_updated", updateUsername);
    };
  }, []);

  const title = Object.entries(routeTitles).find(([k]) =>
    pathname === k || pathname.startsWith(k + "/")
  )?.[1] ?? "Admin";

  return (
    <header className="admin-topbar" id="admin-topbar">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-ink">{title}</h1>
          <p className="text-xs text-muted" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {time}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-link/5 border border-link/10 shadow-[inset_0_0_8px_rgba(0,112,243,0.05)]">
          <span className="w-2 h-2 rounded-full bg-link animate-pulse shadow-[0_0_8px_rgba(0,112,243,0.8)]" />
          <span className="text-[10px] text-link font-semibold uppercase tracking-widest font-mono">
            LIVE
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-ink leading-none">{username}</p>
            <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Administrator</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet/80 to-link/80 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-link/20 border border-white/20">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
