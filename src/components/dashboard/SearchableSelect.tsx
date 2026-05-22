"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { dashboardInputClass } from "@/lib/dashboard/theme";

export type SearchableOption = {
  id: string;
  label: string;
};

type SearchableSelectProps = {
  options: SearchableOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  emptyMessage = "Sin resultados",
}: SearchableSelectProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.id === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(term)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

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

  function handleFocus() {
    if (disabled || loading) return;
    setOpen(true);
    setQuery("");
  }

  function handleSelect(option: SearchableOption) {
    onChange(option.id);
    setQuery(option.label);
    setOpen(false);
  }

  const inputValue = open ? query : selected?.label ?? query;

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
          if (!e.target.value.trim()) {
            onChange("");
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
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-gray-500">{emptyMessage}</li>
          ) : (
            filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2.5 text-left text-sm transition hover:bg-[#00FF00]/15 ${
                    option.id === value
                      ? "bg-[#00FF00]/10 text-[#00FF00]"
                      : "text-white"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
