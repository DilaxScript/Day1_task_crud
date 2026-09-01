"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, type Product } from "@/services/api";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/products");
      return;
    }
    let active = true;
    api
      .getProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-bold">Role App — Products</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Register
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Products</h1>
        

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {loaded && products.length === 0 && !error && (
          <p className="py-10 text-center opacity-60">No products yet.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="mt-1 text-sm opacity-70">
                {product.description || "—"}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold">
                  ₹{Number(product.price).toFixed(2)}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs opacity-70">
                  Qty: {product.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
