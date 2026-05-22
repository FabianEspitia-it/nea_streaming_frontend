"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bffFetch, readBffError } from "@/lib/dashboard/bff";
import type { DashboardUser, UsersListResponse } from "@/lib/dashboard/types";

export default function UsersSection() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bffFetch("/users");
      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }
      const data = (await res.json()) as UsersListResponse;
      setUsers(data.users ?? []);
    } catch {
      toast.error("No se pudo cargar usuarios", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await bffFetch("/users", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      toast.success("Usuario creado", { theme: "dark" });
      setEmail("");
      setPassword("");
      await loadUsers();
    } catch {
      toast.error("No se pudo crear el usuario", { theme: "dark" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(userId: string, userEmail: string) {
    if (!confirm(`¿Eliminar usuario ${userEmail}?`)) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await bffFetch(`/users/${userId}`, { method: "DELETE" });

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      toast.success("Usuario eliminado", { theme: "dark" });
      await loadUsers();
    } catch {
      toast.error("No se pudo eliminar el usuario", { theme: "dark" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-[#00FF00]/40 bg-black/60 p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-[#00FF00]">Crear usuario</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="email"
            required
            placeholder="usuario@codexgogo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[#00FF00]/50 bg-black px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/60"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[#00FF00]/50 bg-black px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/60"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#00FF00] px-6 py-2.5 font-semibold text-black transition hover:bg-green-400 disabled:opacity-50"
        >
          {submitting ? "Creando…" : "Crear usuario"}
        </button>
      </form>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Listado</h3>
          <button
            type="button"
            onClick={loadUsers}
            className="text-sm text-[#00FF00] hover:underline"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-gray-400">Cargando usuarios…</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-10 text-center text-gray-400">No hay usuarios</p>
        ) : (
          <div className="divide-y divide-white/10">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate">{user.email}</p>
                  {user.accounts.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {user.accounts.map((account) => (
                        <li
                          key={account.id}
                          className="text-sm text-gray-300 flex gap-2 min-w-0"
                        >
                          <span className="text-[#00FF00] shrink-0">↳</span>
                          <span className="truncate">{account.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(user.id, user.email)}
                  disabled={deletingId === user.id}
                  className="shrink-0 rounded-lg border border-red-500/60 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deletingId === user.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
