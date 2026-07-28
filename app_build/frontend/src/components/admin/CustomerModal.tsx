"use client";
import { useState } from "react";
import { adminCustomerApi } from "@/lib/api";
import type { Customer } from "@/lib/types";
import toast from "react-hot-toast";

interface CustomerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type CustomerForm = Pick<Customer, "name" | "email" | "phone" | "address">;

const INITIAL_FORM: CustomerForm = { name: "", email: "", phone: "", address: "" };

export default function CustomerModal({ onClose, onSuccess }: CustomerModalProps) {
  const [formData, setFormData] = useState<CustomerForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name) { toast.error("Nama wajib diisi"); return; }
    setLoading(true);
    try {
      await adminCustomerApi.create(formData);
      toast.success("Pelanggan berhasil ditambahkan");
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal menambah pelanggan");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof CustomerForm, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm" id="add-customer-modal">
      <div className="admin-card w-full max-w-md shadow-level-5 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-ink">Tambah Pelanggan Baru</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3" id="add-customer-form">
          <div>
            <label className="admin-label" htmlFor="cust-name">Nama *</label>
            <input
              id="cust-name"
              value={formData.name}
              onChange={(e) => update("name", e.target.value)}
              className="admin-input"
              placeholder="Nama lengkap"
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="cust-email">Email</label>
            <input
              id="cust-email"
              type="email"
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              className="admin-input"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="cust-phone">Telepon</label>
            <input
              id="cust-phone"
              value={formData.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="admin-input"
              placeholder="081234567xxx"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="cust-address">Alamat</label>
            <textarea
              id="cust-address"
              value={formData.address}
              onChange={(e) => update("address", e.target.value)}
              className="admin-input h-auto py-2 resize-none"
              rows={2}
              placeholder="Alamat lengkap"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary flex-1 justify-center disabled:opacity-50"
              id="submit-add-customer"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="admin-btn-secondary flex-1 justify-center"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
