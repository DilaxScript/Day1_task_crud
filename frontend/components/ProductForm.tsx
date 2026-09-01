"use client";

import { useState, type FormEvent } from "react";
import type { Product } from "@/services/api";

interface ProductFormProps {
  editing: Product | null;
  onSave: (data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
  }) => Promise<void>;
  onCancel: () => void;
}

const empty = { name: "", description: "", price: "", quantity: "" };

export default function ProductForm({ editing, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState(
    editing
      ? {
          name: editing.name,
          description: editing.description || "",
          price: String(Number(editing.price)),
          quantity: String(editing.quantity),
        }
      : empty
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <input
        type="text"
        required
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Product name"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          placeholder="Price"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        <input
          type="number"
          required
          min="0"
          step="1"
          value={form.quantity}
          onChange={(e) => set("quantity", e.target.value)}
          placeholder="Quantity"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : editing ? "Update" : "Add product"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
