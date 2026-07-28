"use client";
import { useState } from "react";
import { adminTransactionApi } from "@/lib/api";
import type { Customer } from "@/lib/types";
import toast from "react-hot-toast";

interface TransactionModalProps {
  customers: Customer[];
  onClose: () => void;
  onSuccess: () => void;
}

interface TransactionForm {
  customer_id: number;
  transaction_date: string;
  amount: string;
  description: string;
}

const INITIAL_FORM: TransactionForm = {
  customer_id: 0,
  transaction_date: "",
  amount: "",
  description: "",
};

export default function TransactionModal({ customers, onClose, onSuccess }: TransactionModalProps) {
  const [formData, setFormData] = useState<TransactionForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.customer_id || !formData.transaction_date || !formData.amount) {
      toast.error("Pelanggan, tanggal, dan jumlah wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await adminTransactionApi.create({
        customer_id: formData.customer_id,
        transaction_date: formData.transaction_date,
        amount: parseFloat(formData.amount),
        description: formData.description,
      });
      toast.success("Transaksi berhasil ditambahkan");
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal menambah transaksi");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof TransactionForm, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm" id="add-transaction-modal">
      <div className="admin-card w-full max-w-md shadow-level-5 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-ink">Tambah Transaksi</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3" id="add-transaction-form">
          <div>
            <label className="admin-label" htmlFor="tx-customer">Pelanggan *</label>
            <select
              id="tx-customer"
              value={formData.customer_id}
              onChange={(e) => update("customer_id", +e.target.value)}
              className="admin-select"
              required
            >
              <option value={0}>-- Pilih Pelanggan --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label" htmlFor="tx-date">Tanggal Transaksi *</label>
            <input
              id="tx-date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => update("transaction_date", e.target.value)}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="tx-amount">Jumlah (Rp) *</label>
            <input
              id="tx-amount"
              type="number"
              value={formData.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="admin-input"
              placeholder="350000"
              min="1"
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="tx-desc">Keterangan</label>
            <input
              id="tx-desc"
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              className="admin-input"
              placeholder="Batik Tulis Motif Parang"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary flex-1 justify-center disabled:opacity-50"
              id="submit-add-transaction"
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
