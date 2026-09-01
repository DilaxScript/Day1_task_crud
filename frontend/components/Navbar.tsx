"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, canManageProducts, canManageUsers, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    if (!window.confirm("Are you sure you want to log out?")) {
      return;
    }
    await logout();
    router.push("/login");
  }

  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-600",
    admin: "bg-blue-600",
    editor: "bg-green-600",
    viewer: "bg-gray-600",
    guest: "bg-red-600",
  };

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="font-bold">Role App</span>
        {canManageProducts && (
          <Link href="/products" className="text-sm hover:underline">
            Products
          </Link>
        )}
        {canManageUsers && (
          <Link href="/users" className="text-sm hover:underline">
            Users
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!user && (
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sign in
          </Link>
        )}
        {user && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
              roleColors[user.role] || "bg-gray-600"
            }`}
          >
            {user.role.replace("_", " ")}
          </span>
        )}
        {user && (
          <button
            onClick={handleLogout}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
