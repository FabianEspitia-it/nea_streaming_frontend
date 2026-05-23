"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bffFetch, readBffError } from "@/lib/dashboard/bff";
import { fetchAllAccounts } from "@/lib/dashboard/fetch-all-accounts";
import { fetchAllUsers } from "@/lib/dashboard/fetch-all-users";
import DashboardModal from "@/components/dashboard/DashboardModal";
import SearchableSelect from "@/components/dashboard/SearchableSelect";
import type {
  AccountRow,
  AccountsListResponse,
  DashboardUser,
  LinkUserResponse,
} from "@/lib/dashboard/types";

const PAGE_SIZE = 50;

export default function AccountsSection() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [linkPickerAccounts, setLinkPickerAccounts] = useState<AccountRow[]>([]);
  const [loadingLinkPickers, setLoadingLinkPickers] = useState(false);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bulkEmails, setBulkEmails] = useState("");
  const [linkUserId, setLinkUserId] = useState("");
  const [linkAccountIds, setLinkAccountIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [filters, setFilters] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
    } catch {
      // Silencioso en carga inicial de usuarios.
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(PAGE_SIZE),
        sort_by: "created_at",
        order: "desc",
      });

      if (appliedEmail.trim()) {
        params.set("email", appliedEmail.trim());
      }

      const res = await bffFetch(`/accounts?${params.toString()}`);

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      const data = (await res.json()) as AccountsListResponse;
      setAccounts(data.accounts ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("No se pudo cargar cuentas", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  }, [skip, appliedEmail]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const loadLinkPickerData = useCallback(async () => {
    setLoadingLinkPickers(true);
    try {
      const [allUsers, allAccounts] = await Promise.all([
        fetchAllUsers(),
        fetchAllAccounts(),
      ]);

      setUsers(allUsers);
      setLinkPickerAccounts(allAccounts);
    } catch {
      toast.error("No se pudieron cargar usuarios y cuentas", { theme: "dark" });
    } finally {
      setLoadingLinkPickers(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    const rows = await fetchAllUsers({ email: query });
    return rows.map((user) => ({ id: user.id, label: user.email }));
  }, []);

  const searchAccounts = useCallback(async (query: string) => {
    const rows = await fetchAllAccounts({ email: query });
    return rows.map((account) => ({ id: account.id, label: account.email }));
  }, []);

  function openLinkModal() {
    setLinkUserId("");
    setLinkAccountIds([]);
    setLinkModalOpen(true);
    loadLinkPickerData();
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedEmail(filters);
    setSkip(0);
  }

  async function handleBulkCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emails = bulkEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      toast.error("Ingresa al menos un email", { theme: "dark" });
      return;
    }

    setBusy(true);
    try {
      const res = await bffFetch("/accounts/bulk", {
        method: "POST",
        body: JSON.stringify({
          accounts: emails.map((email) => ({ email })),
        }),
      });

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      const data = (await res.json()) as {
        created: AccountRow[];
        skipped: { email: string; reason: string }[];
      };

      toast.success(
        `Creadas: ${data.created?.length ?? 0}, omitidas: ${data.skipped?.length ?? 0}`,
        { theme: "dark" }
      );
      setBulkEmails("");
      setBulkModalOpen(false);
      setSkip(0);
      await loadAccounts();
    } catch {
      toast.error("No se pudieron crear las cuentas", { theme: "dark" });
    } finally {
      setBusy(false);
    }
  }

  async function handleLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!linkUserId || linkAccountIds.length === 0) {
      toast.error("Selecciona usuario y al menos una cuenta", { theme: "dark" });
      return;
    }

    setBusy(true);
    try {
      const res = await bffFetch("/accounts/link-user", {
        method: "POST",
        body: JSON.stringify({
          user_id: linkUserId,
          account_ids: linkAccountIds,
        }),
      });

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      const data = (await res.json()) as LinkUserResponse;

      toast.success(
        `Vinculadas: ${data.created?.length ?? 0}, omitidas: ${data.skipped?.length ?? 0}`,
        { theme: "dark" }
      );
      setLinkUserId("");
      setLinkAccountIds([]);
      setLinkModalOpen(false);
      await loadUsers();
      await loadAccounts();
    } catch {
      toast.error("No se pudo vincular", { theme: "dark" });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(accountId: string, accountEmail: string) {
    if (!confirm(`¿Eliminar cuenta ${accountEmail}?`)) {
      return;
    }

    setDeletingId(accountId);
    try {
      const res = await bffFetch(`/accounts/${accountId}`, { method: "DELETE" });

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      toast.success("Cuenta eliminada", { theme: "dark" });
      await loadAccounts();
    } catch {
      toast.error("No se pudo eliminar la cuenta", { theme: "dark" });
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setBulkModalOpen(true)}
          className="rounded-lg bg-[#00FF00] px-6 py-2.5 font-semibold text-black transition hover:bg-green-400"
        >
          Crear cuentas 
        </button>
        <button
          type="button"
          onClick={openLinkModal}
          className="rounded-lg border border-[#00FF00] px-6 py-2.5 font-semibold text-[#00FF00] transition hover:bg-[#00FF00]/10"
        >
          Vincular usuario ↔ cuentas
        </button>
      </div>

      <DashboardModal
        open={bulkModalOpen}
        title="Crear cuentas"
        onClose={() => {
          if (!busy) setBulkModalOpen(false);
        }}
      >
        <form onSubmit={handleBulkCreate} className="space-y-4">
          <textarea
            rows={6}
            placeholder="Un email por línea (o separados por coma)"
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            className="w-full rounded-lg border border-[#00FF00]/50 bg-black px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/60"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setBulkModalOpen(false)}
              disabled={busy}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#00FF00] px-6 py-2.5 font-semibold text-black hover:bg-green-400 disabled:opacity-50"
            >
              {busy ? "Creando…" : "Crear cuentas"}
            </button>
          </div>
        </form>
      </DashboardModal>

      <DashboardModal
        open={linkModalOpen}
        title="Vincular usuario ↔ cuentas"
        wide
        onClose={() => {
          if (!busy) setLinkModalOpen(false);
        }}
      >
        <form onSubmit={handleLink} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <span className="text-xs font-medium text-[#00FF00]/80">
                Usuario
              </span>
              <SearchableSelect
                options={users.map((u) => ({ id: u.id, label: u.email }))}
                value={linkUserId}
                onChange={setLinkUserId}
                placeholder="Buscar usuario…"
                loading={loadingLinkPickers}
                emptyMessage="No hay usuarios con ese correo"
                onSearch={searchUsers}
              />
            </div>
            <div className="min-w-0 space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-[#00FF00]/80">
                Cuentas
              </span>
              <SearchableSelect
                multiple
                options={linkPickerAccounts.map((a) => ({
                  id: a.id,
                  label: a.email,
                }))}
                value={linkAccountIds}
                onChange={setLinkAccountIds}
                placeholder="Buscar cuentas…"
                loading={loadingLinkPickers}
                emptyMessage="No hay cuentas con ese correo"
                onSearch={searchAccounts}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              disabled={busy}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg border border-[#00FF00] px-6 py-2.5 font-semibold text-[#00FF00] hover:bg-[#00FF00]/10 disabled:opacity-50"
            >
              {busy ? "Vinculando…" : "Vincular"}
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
          {total} cuenta{total !== 1 ? "s" : ""} · página {currentPage} de{" "}
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
          <h3 className="text-lg font-semibold text-white">Cuentas</h3>
          <button
            type="button"
            onClick={loadAccounts}
            className="text-sm text-[#00FF00] hover:underline"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-gray-400">Cargando…</p>
        ) : accounts.length === 0 ? (
          <p className="px-6 py-10 text-center text-gray-400">No hay cuentas</p>
        ) : (
          <div className="divide-y divide-white/10">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <p className="text-white truncate min-w-0">{account.email}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(account.id, account.email)}
                  disabled={deletingId === account.id}
                  className="shrink-0 rounded-lg border border-red-500/60 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deletingId === account.id ? "Eliminando…" : "Eliminar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
