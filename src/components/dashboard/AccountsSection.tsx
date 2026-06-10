"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bffFetch, readBffError } from "@/lib/dashboard/bff";
import { searchAccounts } from "@/lib/dashboard/search-accounts";
import { searchUsers } from "@/lib/dashboard/search-users";
import DashboardModal from "@/components/dashboard/DashboardModal";
import SearchableSelect from "@/components/dashboard/SearchableSelect";
import type {
  AccountRow,
  AccountsListResponse,
  LinkUserResponse,
} from "@/lib/dashboard/types";

const PAGE_SIZE = 50;

export default function AccountsSection() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bulkEmails, setBulkEmails] = useState("");
  const [linkUserId, setLinkUserId] = useState("");
  const [linkEmailsText, setLinkEmailsText] = useState("");
  const [resolvedAccounts, setResolvedAccounts] = useState<
    { id: string; email: string }[]
  >([]);
  const [notFoundEmails, setNotFoundEmails] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [filters, setFilters] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");

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
    loadAccounts();
  }, [loadAccounts]);

  const searchUsersForPicker = useCallback(async (query: string) => {
    const rows = await searchUsers(query);
    return rows.map((user) => ({ id: user.id, label: user.email }));
  }, []);

  function openLinkModal() {
    setLinkUserId("");
    setLinkEmailsText("");
    setResolvedAccounts([]);
    setNotFoundEmails([]);
    setSearched(false);
    setLinkModalOpen(true);
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

  async function handleSearchEmails() {
    const pastedEmails = linkEmailsText
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (pastedEmails.length === 0) {
      toast.error("Pega al menos un email de cuenta", { theme: "dark" });
      return;
    }

    setBusy(true);
    try {
      const notFound: string[] = [];
      const found: { id: string; email: string }[] = [];

      const results = await Promise.all(
        pastedEmails.map((email) => searchAccounts(email))
      );

      for (let i = 0; i < pastedEmails.length; i++) {
        const matches = results[i];
        const exactMatch = matches.find(
          (a) => a.email.toLowerCase() === pastedEmails[i].toLowerCase()
        );

        if (exactMatch) {
          found.push({ id: exactMatch.id, email: exactMatch.email });
        } else {
          notFound.push(pastedEmails[i]);
        }
      }

      setResolvedAccounts(found);
      setNotFoundEmails(notFound);
      setSearched(true);

      if (found.length > 0) {
        toast.success(`${found.length} cuenta(s) encontrada(s)`, { theme: "dark" });
      }

      if (notFound.length > 0) {
        toast.warn(
          `${notFound.length} email(s) no encontrado(s)`,
          { theme: "dark" }
        );
      }
    } catch {
      toast.error("Error al buscar cuentas", { theme: "dark" });
    } finally {
      setBusy(false);
    }
  }

  async function handleLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!linkUserId) {
      toast.error("Selecciona un usuario", { theme: "dark" });
      return;
    }

    if (resolvedAccounts.length === 0) {
      toast.error("No hay cuentas encontradas para vincular", { theme: "dark" });
      return;
    }

    setBusy(true);
    try {
      const finalAccountIds = resolvedAccounts.map((a) => a.id);

      const res = await bffFetch("/accounts/link-user", {
        method: "POST",
        body: JSON.stringify({
          user_id: linkUserId,
          account_ids: finalAccountIds,
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
      setLinkEmailsText("");
      setResolvedAccounts([]);
      setNotFoundEmails([]);
      setSearched(false);
      setLinkModalOpen(false);
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
          <div className="space-y-4">
            <div className="min-w-0 space-y-1.5">
              <span className="text-xs font-medium text-[#00FF00]/80">
                Usuario
              </span>
              <SearchableSelect
                options={[]}
                value={linkUserId}
                onChange={setLinkUserId}
                placeholder="Buscar usuario…"
                emptyMessage="Escribe para buscar usuarios"
                onSearch={searchUsersForPicker}
              />
            </div>
            <div className="min-w-0 space-y-1.5">
              <span className="text-xs font-medium text-[#00FF00]/80">
                Cuentas (pegar emails)
              </span>
              <textarea
                rows={6}
                placeholder="Pega los emails de las cuentas a vincular (uno por línea, o separados por coma)"
                value={linkEmailsText}
                onChange={(e) => {
                  setLinkEmailsText(e.target.value);
                  setSearched(false);
                  setResolvedAccounts([]);
                  setNotFoundEmails([]);
                }}
                className="w-full rounded-lg border border-[#00FF00]/50 bg-black px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF00]/60"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {linkEmailsText.split(/[\n,;]+/).filter((e) => e.trim()).length > 0
                    ? `${linkEmailsText.split(/[\n,;]+/).filter((e) => e.trim()).length} email(s) detectados`
                    : "Puedes copiar y pegar una lista de correos"}
                </p>
                <button
                  type="button"
                  onClick={handleSearchEmails}
                  disabled={busy || linkEmailsText.trim().length === 0}
                  className="rounded-lg bg-[#00FF00] px-4 py-1.5 text-xs font-semibold text-black hover:bg-green-400 disabled:opacity-50"
                >
                  {busy && !searched ? "Buscando…" : "Buscar"}
                </button>
              </div>
            </div>

            {searched && (
              <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                {resolvedAccounts.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#00FF00]">
                      Encontradas ({resolvedAccounts.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {resolvedAccounts.map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center rounded-full border border-[#00FF00]/40 bg-[#00FF00]/10 px-2.5 py-1 text-xs text-[#00FF00]"
                        >
                          {a.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {notFoundEmails.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-red-400">
                      No encontradas ({notFoundEmails.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {notFoundEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs text-red-400"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
              disabled={busy || resolvedAccounts.length === 0}
              className="rounded-lg border border-[#00FF00] px-6 py-2.5 font-semibold text-[#00FF00] hover:bg-[#00FF00]/10 disabled:opacity-50"
            >
              {busy && searched ? "Vinculando…" : "Vincular"}
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
