"use client";

import type { Product } from "@/services/api";

interface ProductTableProps {
  products: Product[];
  canManage: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductTable({
  products,
  canManage,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <p className="text-center py-10 opacity-60">No products yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left opacity-60">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4">Price</th>
            <th className="py-2 pr-4">Qty</th>
            {canManage && <th className="py-2 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2 pr-4 font-medium">{product.name}</td>
              <td className="py-2 pr-4 opacity-70">
                {product.description || "—"}
              </td>
              <td className="py-2 pr-4">Rs. {Number(product.price).toFixed(2)}</td>
              <td className="py-2 pr-4">{product.quantity}</td>
              {canManage && (
                <td className="py-2 text-right">
                  <button
                    onClick={() => onEdit(product)}
                    className="mr-2 rounded-lg border px-3 py-1 text-xs hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
