"use client";
import { useState } from "react";
import { adminTransactionApi } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import toast from "react-hot-toast";

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTransactionModal({ transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    transaction_date: transaction.transaction_date.split("T")[0],
    description: transaction.description ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await adminTransactionApi.update(transaction.id, {
        amount: Number(formData.amount),
        transaction_date: formData.transaction_date,
        description: formData.description,
      });
      toast.success("Transaksi berhasil diubah");
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal mengubah transaksi");
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm" id="edit-transaction-modal">
      <div className="admin-card w-full max-w-md shadow-level-5 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-ink">Edit Transaksi</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3" id="edit-transaction-form">
          <div>
            <label className="admin-label">Pelanggan</label>
            <input
              type="text"
              className="admin-input bg-canvas-soft text-muted cursor-not-allowed"
              value={transaction.customer?.name ?? ""}
              disabled
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="edit-tx-amount">Nominal (Rp) *</label>
            <input
              id="edit-tx-amount"
              type="number"
              className="admin-input"
              value={formData.amount}
              onChange={(e) => update("amount", Number(e.target.value))}
              required
              min="1"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="edit-tx-date">Tanggal Transaksi *</label>
            <input
              id="edit-tx-date"
              type="date"
              className="admin-input"
              value={formData.transaction_date}
              onChange={(e) => update("transaction_date", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="edit-tx-desc">Keterangan</label>
            <input
              id="edit-tx-desc"
              type="text"
              className="admin-input"
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Opsional"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="admin-btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
