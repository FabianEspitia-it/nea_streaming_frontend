"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bffFetch, readBffError } from "@/lib/dashboard/bff";
import DashboardModal from "@/components/dashboard/DashboardModal";
import SearchableSelect from "@/components/dashboard/SearchableSelect";
import type {
  DashboardUser,
  UnlinkUserResponse,
  UsersListResponse,
} from "@/lib/dashboard/types";

const PAGE_SIZE = 50;

export default function UsersSection() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filters, setFilters] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [unlinkUser, setUnlinkUser] = useState<DashboardUser | null>(null);
  const [unlinkAccountIds, setUnlinkAccountIds] = useState<string[]>([]);
  const [unlinkBusy, setUnlinkBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(PAGE_SIZE),
      });

      if (appliedEmail.trim()) {
        params.set("email", appliedEmail.trim());
      }

      const res = await bffFetch(`/users?${params.toString()}`);
      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }
      const data = (await res.json()) as UsersListResponse;
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("No se pudo cargar usuarios", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  }, [skip, appliedEmail]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedEmail(filters);
    setSkip(0);
  }

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
      setSkip(0);
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

  function openUnlinkModal(user: DashboardUser) {
    setUnlinkUser(user);
    setUnlinkAccountIds([]);
    setUnlinkModalOpen(true);
  }

  async function handleUnlink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!unlinkUser || unlinkAccountIds.length === 0) {
      toast.error("Selecciona al menos una cuenta", { theme: "dark" });
      return;
    }

    setUnlinkBusy(true);
    try {
      const res = await bffFetch("/accounts/unlink-user", {
        method: "DELETE",
        body: JSON.stringify({
          user_id: unlinkUser.id,
          account_ids: unlinkAccountIds,
        }),
      });

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      const data = (await res.json()) as UnlinkUserResponse;

      toast.success(
        `Desvinculadas: ${data.removed?.length ?? 0}, omitidas: ${data.skipped?.length ?? 0}`,
        { theme: "dark" }
      );
      setUnlinkModalOpen(false);
      setUnlinkUser(null);
      setUnlinkAccountIds([]);
      await loadUsers();
    } catch {
      toast.error("No se pudo desvincular", { theme: "dark" });
    } finally {
      setUnlinkBusy(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

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

      <DashboardModal
        open={unlinkModalOpen}
        title="Desvincular cuentas"
        wide
        onClose={() => {
          if (!unlinkBusy) {
            setUnlinkModalOpen(false);
            setUnlinkUser(null);
            setUnlinkAccountIds([]);
          }
        }}
      >
        <form onSubmit={handleUnlink} className="space-y-4">
          {unlinkUser && (
            <p className="text-sm text-gray-300">
              Usuario:{" "}
              <span className="font-medium text-white">{unlinkUser.email}</span>
            </p>
          )}
          <div className="min-w-0 space-y-1.5">
            <span className="text-xs font-medium text-[#00FF00]/80">
              Cuentas vinculadas
            </span>
            <SearchableSelect
              multiple
              options={(unlinkUser?.accounts ?? []).map((account) => ({
                id: account.id,
                label: account.email,
              }))}
              value={unlinkAccountIds}
              onChange={setUnlinkAccountIds}
              placeholder="Buscar cuentas…"
              emptyMessage="No hay cuentas vinculadas"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setUnlinkModalOpen(false)}
              disabled={unlinkBusy}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={unlinkBusy}
              className="rounded-lg border border-red-500/60 px-6 py-2.5 font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              {unlinkBusy ? "Desvinculando…" : "Desvincular"}
            </button>
          </div>
        </form>
      </DashboardModal>

      <form
        onSubmit={handleFilterSubmit}
        className="rounded-xl border border-[#00FF00]/40 bg-black/60 p-6"
      >
        <input
          type="text"
          placeholder="Buscar por email"
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
          className="w-full rounded-lg border border-[#00FF00]/50 bg-black px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/60"
        />
      </form>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {total} usuario{total !== 1 ? "s" : ""} · página {currentPage} de{" "}
          {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={skip === 0 || loading}
            onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
            className="rounded border border-white/20 px-3 py-1.5 hover:border-[#00FF00]/50 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={skip + PAGE_SIZE >= total || loading}
            onClick={() => setSkip((s) => s + PAGE_SIZE)}
            className="rounded border border-white/20 px-3 py-1.5 hover:border-[#00FF00]/50 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>

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
                <div className="flex shrink-0 flex-wrap gap-2">
                  {user.accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => openUnlinkModal(user)}
                      className="rounded-lg border border-[#00FF00]/60 px-4 py-2 text-sm text-[#00FF00] hover:bg-[#00FF00]/10"
                    >
                      Desvincular cuentas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={deletingId === user.id}
                    className="rounded-lg border border-red-500/60 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deletingId === user.id ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
