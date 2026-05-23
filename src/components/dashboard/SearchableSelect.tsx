"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { dashboardInputClass } from "@/lib/dashboard/theme";

export type SearchableOption = {
  id: string;
  label: string;
};

type SearchableSelectBaseProps = {
  options: SearchableOption[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  /** Búsqueda en servidor (p. ej. cuentas fuera del lote inicial). */
  onSearch?: (query: string) => Promise<SearchableOption[]>;
  minSearchLength?: number;
};

type SingleSelectProps = SearchableSelectBaseProps & {
  multiple?: false;
  value: string;
  onChange: (id: string) => void;
};

type MultiSelectProps = SearchableSelectBaseProps & {
  multiple: true;
  value: string[];
  onChange: (ids: string[]) => void;
};

type SearchableSelectProps = SingleSelectProps | MultiSelectProps;

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  emptyMessage = "Sin resultados",
  onSearch,
  minSearchLength = 1,
  multiple = false,
}: SearchableSelectProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteOptions, setRemoteOptions] = useState<SearchableOption[]>([]);
  const [searching, setSearching] = useState(false);

  const selectedIds = useMemo((): string[] => {
    if (Array.isArray(value)) {
      return value;
    }

    return value ? [value] : [];
  }, [value]);

  const selectedOptions = useMemo(() => {
    const merged = new Map<string, SearchableOption>();

    for (const option of options) {
      merged.set(option.id, option);
    }

    for (const option of remoteOptions) {
      merged.set(option.id, option);
    }

    return selectedIds
      .map((id) => merged.get(id))
      .filter((option): option is SearchableOption => Boolean(option));
  }, [options, remoteOptions, selectedIds]);

  const selected = multiple ? undefined : selectedOptions[0];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return options;
    }

    const localMatches = options.filter((option) =>
      option.label.toLowerCase().includes(term)
    );

    if (onSearch && term.length >= minSearchLength) {
      const merged = new Map<string, SearchableOption>();

      for (const option of localMatches) {
        merged.set(option.id, option);
      }

      for (const option of remoteOptions) {
        merged.set(option.id, option);
      }

      return Array.from(merged.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      );
    }

    return localMatches;
  }, [options, query, remoteOptions, onSearch, minSearchLength]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery(selected?.label ?? "");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, selected?.label]);

  useEffect(() => {
    setQuery(selected?.label ?? "");
  }, [selected?.label, value]);

  useEffect(() => {
    if (!onSearch || !open) {
      return;
    }

    const term = query.trim();

    if (term.length < minSearchLength) {
      setRemoteOptions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = window.setTimeout(() => {
      void onSearch(term)
        .then((results) => {
          setRemoteOptions(results);
        })
        .catch(() => {
          setRemoteOptions([]);
        })
        .finally(() => {
          setSearching(false);
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, onSearch, open, minSearchLength]);

  function handleFocus() {
    if (disabled || loading) {
      return;
    }

    setOpen(true);
    setQuery("");
  }

  function handleSelect(option: SearchableOption) {
    if (multiple) {
      const next = selectedIds.includes(option.id)
        ? selectedIds.filter((id) => id !== option.id)
        : [...selectedIds, option.id];
      (onChange as (ids: string[]) => void)(next);
      setQuery("");
      return;
    }

    (onChange as (id: string) => void)(option.id);
    setQuery(option.label);
    setOpen(false);
  }

  function handleRemove(id: string) {
    if (!multiple) {
      return;
    }

    (onChange as (ids: string[]) => void)(
      selectedIds.filter((selectedId) => selectedId !== id)
    );
  }

  const inputValue = open
    ? query
    : multiple
      ? selectedOptions.length > 0
        ? `${selectedOptions.length} seleccionada${selectedOptions.length !== 1 ? "s" : ""}`
        : ""
      : selected?.label ?? query;
  const listLoading = loading || searching;

  return (
    <div ref={containerRef} className="relative min-w-0">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={loading ? "Cargando…" : placeholder}
        value={inputValue}
        disabled={disabled || loading}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);

          if (!multiple && !e.target.value.trim()) {
            (onChange as (id: string) => void)("");
          }
        }}
        onFocus={handleFocus}
        className={dashboardInputClass}
      />

      {open && !disabled && !loading && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#00FF00]/40 bg-black shadow-lg"
        >
          {listLoading ? (
            <li className="px-3 py-2.5 text-sm text-gray-500">Buscando…</li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-gray-500">{emptyMessage}</li>
          ) : (
            filtered.map((option) => {
              const isSelected = selectedIds.includes(option.id);

              return (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-[#00FF00]/15 ${
                      isSelected
                        ? "bg-[#00FF00]/10 text-[#00FF00]"
                        : "text-white"
                    }`}
                  >
                    {multiple && (
                      <span
                        aria-hidden
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          isSelected
                            ? "border-[#00FF00] bg-[#00FF00] text-black"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    )}
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      {multiple && selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#00FF00]/40 bg-[#00FF00]/10 px-2.5 py-1 text-xs text-[#00FF00]"
            >
              <span className="truncate">{option.label}</span>
              <button
                type="button"
                aria-label={`Quitar ${option.label}`}
                onClick={() => handleRemove(option.id)}
                className="shrink-0 text-[#00FF00]/80 hover:text-[#00FF00]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
