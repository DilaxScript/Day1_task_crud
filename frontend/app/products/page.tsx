"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";
import ProductTable from "@/components/ProductTable";
import { api, type Product } from "@/services/api";

export default function ProductsPage() {
  const { user, loading, canManageProducts } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    if (user.role === "guest") {
      router.replace("/login");
      return;
    }
    let active = true;
    api
      .getProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [loading, user, router]);

  async function handleCreate(data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
  }) {
    await api.createProduct(data);
    setShowForm(false);
    await loadProducts();
  }

  async function handleUpdate(data: {
    name: string;
    description: string;
    price: number;
    quantity: number;
  }) {
    if (editing) {
      await api.updateProduct(editing.id, data);
      setEditing(null);
      await loadProducts();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    await api.deleteProduct(id);
    await loadProducts();
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>
          {canManageProducts && !showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add product
            </button>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {canManageProducts && (showForm || editing) && (
          <div className="mb-6">
            <ProductForm
              editing={editing}
              onSave={editing ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        {!canManageProducts && (
          <p className="mb-4 rounded-lg bg-gray-100 px-3 py-2 text-sm opacity-70">
            View only — you cannot create, edit, or delete products.
          </p>
        )}

        {loaded && (
          <ProductTable
            products={products}
            canManage={canManageProducts}
            onEdit={(product) => {
              setEditing(product);
              setShowForm(false);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>
    </main>
  );
}
