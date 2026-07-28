"use client";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function PengaturanPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Load current username
    const currentUsername = localStorage.getItem("gb_username") || "";
    setUsername(currentUsername);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.updateProfile({
        username: username || undefined,
        password: password || undefined,
      });
      toast.success(res.message || "Profil berhasil diperbarui");
      if (res.data?.username) {
        localStorage.setItem("gb_username", res.data.username);
        window.dispatchEvent(new Event("gb_username_updated"));
      }
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Pengaturan</h1>
          <p className="text-sm text-muted">Kelola akun dan pengaturan website</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* User Settings */}
        <div className="admin-card">
          <h2 className="text-sm font-semibold text-ink mb-4 border-b border-hairline pb-2">
            Pengaturan Profil Admin
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="admin-label">Username</label>
              <input
                type="text"
                className="admin-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nama admin"
              />
            </div>
            <div>
              <label className="admin-label">Password Baru (Opsional)</label>
              <input
                type="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kosongkan jika tidak ingin mengubah"
              />
            </div>
            {password && (
              <div>
                <label className="admin-label">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className="admin-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary"
            >
              {loading ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
