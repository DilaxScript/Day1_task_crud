"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { api, type User } from "@/services/api";

const ROLES = ["super_admin", "admin", "editor", "viewer", "guest"];

const ROLE_COLORS: Record<string, string> = {
  super_admin: "#7c3aed",
  admin: "#2563eb",
  editor: "#16a34a",
  viewer: "#6b7280",
  guest: "#dc2626",
};

const emptyForm = { name: "", email: "", password: "", role: "viewer" };

export default function UsersPage() {
  const { user, loading, canManageUsers } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await api.getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || !canManageUsers)) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    let active = true;
    api
      .getUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load users");
      });
    return () => {
      active = false;
    };
  }, [loading, user, canManageUsers, router]);

  const usableRoles = useMemo(() => {
    if (user?.role === "admin") {
      return ["editor", "viewer", "guest"];
    }
    return ROLES;
  }, [user]);

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setForm(emptyForm);
      setShowForm(false);
      setMessage("User created.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  async function handleRoleChange(id: number, role: string) {
    setError("");
    try {
      await api.updateUser(id, { role });
      setMessage("Role updated.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleDelete(id: number) {
    setError("");
    try {
      await api.deleteUser(id);
      setMessage("User deleted.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  if (loading || !user || !canManageUsers) {
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
          <h1 className="text-2xl font-bold">Manage Users</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add user
            </button>
          )}
        </div>

        {message && (
          <p className="mb-4 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2"
          >
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Name"
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Email"
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder="Password"
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              style={{ backgroundColor: ROLE_COLORS[form.role] }}
              className="rounded-lg border px-3 py-2 text-sm font-medium text-white"
            >
              {usableRoles.map((role) => (
                <option key={role} value={role} className="text-black">
                  {role.replace("_", " ")}
                </option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create user
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left opacity-60">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 opacity-70">{u.email}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ backgroundColor: ROLE_COLORS[u.role] }}
                      className="rounded-lg border px-2 py-1 text-xs font-medium text-white"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role} className="text-black">
                          {role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={u.role === "super_admin"}
                      className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
