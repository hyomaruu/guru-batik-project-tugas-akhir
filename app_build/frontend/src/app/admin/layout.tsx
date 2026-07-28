"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";
import { authApi } from "@/lib/api";
import BatikMotif from "@/components/public/BatikMotif";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem("gb_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    authApi.me()
      .then(() => setChecking(false))
      .catch(() => {
        localStorage.removeItem("gb_token");
        localStorage.removeItem("gb_username");
        router.replace("/admin/login");
      });
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted">Memverifikasi sesi...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 relative transition-colors duration-300">
        <div className="fixed inset-0 pointer-events-none z-[-1] admin-bg-layer" />
        <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
          <div className="opacity-30 dark:opacity-40">
            <BatikMotif variant="tech-batik" opacity={0.4} />
          </div>
        </div>
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {/* Mobile backdrop overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="flex-1 flex flex-col min-w-0 z-10 relative h-screen">
          <AdminTopbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-6 md:p-8 overflow-auto animate-fade-in relative z-0">
            <div className="max-w-7xl mx-auto pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
