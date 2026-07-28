"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";
import BatikMotif from "@/components/public/BatikMotif";
import ScrollReveal from "@/components/public/ScrollReveal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("gb_token", res.data.token);
      localStorage.setItem("gb_username", res.data.username || res.data.admin?.username || "Admin");
      toast.success("Login berhasil!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: "#020617" }} id="login-page">
      
      {/* Background glow & Motif */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)",
        }}
      />
      <BatikMotif variant="tech-batik" opacity={0.06} />

      <ScrollReveal>
        <div className="w-full max-w-sm relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex relative w-40 h-14 items-center justify-center mb-6">
              <Image 
                src="/logo.png" 
                alt="Guru Batik Logo" 
                fill 
                className="object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Admin Panel</h1>
            <p className="text-sm text-blue-200/60">Sistem Informasi UMKM Guru Batik</p>
          </div>

          {/* Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-lg px-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5" htmlFor="login-password">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 bg-slate-950/50 border border-white/10 rounded-lg px-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPwd
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg
                           shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                    Memverifikasi...
                  </>
                ) : "Masuk"}
              </button>
            </form>


          </div>

          <p className="text-center text-xs text-white/40 mt-8">
            <a href="/" className="hover:text-white transition-colors duration-300 inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Kembali ke Portal Publik
            </a>
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
