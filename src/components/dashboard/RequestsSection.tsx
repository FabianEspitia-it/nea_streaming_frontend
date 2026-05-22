"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bffFetch, readBffError } from "@/lib/dashboard/bff";
import { dashboardInputClass } from "@/lib/dashboard/theme";
import type {
  RequestLogItem,
  RequestsListResponse,
  ServiceItem,
  ServicesListResponse,
} from "@/lib/dashboard/types";

const PAGE_SIZE = 50;

type RequestFilters = {
  email: string;
  requested_by: string;
  service_name: string;
  start_date: string;
  end_date: string;
};

const DEFAULT_FILTERS: RequestFilters = {
  email: "",
  requested_by: "",
  service_name: "",
  start_date: "",
  end_date: "",
};

function formatRequestDate(iso: string | null): string {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getRequesterInitial(email: string | null | undefined): string {
  if (!email) return "?";
  const first = email.trim()[0];
  return first ? first.toUpperCase() : "?";
}

function serviceBadgeClass(serviceName: string | null | undefined): string {
  const name = (serviceName ?? "").toLowerCase();

  if (name.includes("netflix")) {
    return "bg-red-500/15 text-red-300 border-red-500/40";
  }
  if (name.includes("disney")) {
    return "bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30";
  }
  if (name.includes("prime")) {
    return "bg-[#00FF00]/10 text-green-200 border-[#00FF00]/25";
  }
  if (name.includes("hbo")) {
    return "bg-[#00FF00]/5 text-gray-200 border-[#00FF00]/20";
  }
  if (name.includes("crunchyroll")) {
    return "bg-orange-500/15 text-orange-300 border-orange-500/40";
  }
  if (name.includes("universal")) {
    return "bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30";
  }

  return "bg-black text-[#00FF00] border-[#00FF00]/40";
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#00FF00]/80">{label}</span>
      {children}
    </label>
  );
}

export default function RequestsSection() {
  const [items, setItems] = useState<RequestLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [filters, setFilters] = useState<RequestFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<RequestFilters>(DEFAULT_FILTERS);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        limit: String(PAGE_SIZE),
      });

      if (appliedFilters.email.trim()) {
        params.set("email", appliedFilters.email.trim());
      }
      if (appliedFilters.requested_by.trim()) {
        params.set("requested_by", appliedFilters.requested_by.trim());
      }
      if (appliedFilters.service_name.trim()) {
        params.set("service_name", appliedFilters.service_name.trim());
      }
      if (appliedFilters.start_date) {
        params.set("start_date", `${appliedFilters.start_date}T00:00:00`);
      }
      if (appliedFilters.end_date) {
        params.set("end_date", `${appliedFilters.end_date}T23:59:59`);
      }

      const res = await bffFetch(`/requests?${params.toString()}`);

      if (!res.ok) {
        toast.error(await readBffError(res), { theme: "dark" });
        return;
      }

      const data = (await res.json()) as RequestsListResponse;
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("No se pudieron cargar solicitudes", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  }, [skip, appliedFilters]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    async function loadServices() {
      setLoadingServices(true);
      try {
        const res = await bffFetch("/services");
        if (!res.ok) {
          toast.error(await readBffError(res), { theme: "dark" });
          return;
        }
        const data = (await res.json()) as ServicesListResponse;
        setServices(data.items ?? []);
      } catch {
        toast.error("No se pudieron cargar los servicios", { theme: "dark" });
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, []);

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(filters);
    setSkip(0);
  }

  const rangeStart = total === 0 ? 0 : skip + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(skip + items.length, total);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleFilterSubmit}
        className="rounded-xl border border-[#00FF00]/40 bg-black/60 p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <FilterField label="Correo cliente">
            <input
              type="email"
              placeholder="cliente@codexgogo.com"
              value={filters.email}
              onChange={(e) =>
                setFilters((f) => ({ ...f, email: e.target.value }))
              }
              className={dashboardInputClass}
            />
          </FilterField>

          <FilterField label="Solicitado por">
            <input
              type="text"
              placeholder="admin@codexgogo.com"
              value={filters.requested_by}
              onChange={(e) =>
                setFilters((f) => ({ ...f, requested_by: e.target.value }))
              }
              className={dashboardInputClass}
            />
          </FilterField>

          <FilterField label="Servicio">
            <select
              value={filters.service_name}
              onChange={(e) =>
                setFilters((f) => ({ ...f, service_name: e.target.value }))
              }
              disabled={loadingServices}
              className={dashboardInputClass}
            >
              <option value="">
                {loadingServices ? "Cargando…" : "Todos"}
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Desde">
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) =>
                setFilters((f) => ({ ...f, start_date: e.target.value }))
              }
              className={dashboardInputClass}
            />
          </FilterField>

          <FilterField label="Hasta">
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) =>
                setFilters((f) => ({ ...f, end_date: e.target.value }))
              }
              className={dashboardInputClass}
            />
          </FilterField>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00FF00] px-5 py-2.5 text-sm font-semibold text-black hover:bg-green-400 transition"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Listado</h3>
            {total > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {total} solicitud{total !== 1 ? "es" : ""} · mostrando{" "}
                {rangeStart}-{rangeEnd}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => loadRequests()}
            disabled={loading}
            className="text-sm text-[#00FF00] hover:underline disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3">Solicitado por</th>
                <th className="px-4 py-3">Correo cliente</th>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Cargando solicitudes…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Sin registros para los filtros seleccionados
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00FF00] text-sm font-semibold text-black"
                        >
                          {getRequesterInitial(item.requested_by)}
                        </span>
                        <span className="text-white truncate">
                          {item.requested_by ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">
                      {item.email || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {item.service_name ? (
                        <span
                          className={`inline-block rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${serviceBadgeClass(item.service_name)}`}
                        >
                          {item.service_name}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-400 max-w-[200px] truncate">
                      {item.service_action_name ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                      {formatRequestDate(item.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Página {Math.floor(skip / PAGE_SIZE) + 1} de{" "}
            {Math.max(1, Math.ceil(total / PAGE_SIZE))}
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
      )}
    </div>
  );
}
