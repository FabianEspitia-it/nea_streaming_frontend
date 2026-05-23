"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
  DASHBOARD_SECTIONS,
  getDashboardSection,
} from "@/lib/dashboard/sections";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeMeta = getDashboardSection(pathname);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00FF00 1px, transparent 1px), linear-gradient(90deg, #00FF00 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <aside className="relative z-20 flex w-64 shrink-0 flex-col border-r border-[#00FF00]/20 bg-black/95">
        <div className="border-b border-white/10 px-5 py-6">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-[#00FF00] transition"
          >
            ← Inicio
          </Link>
          <div className="mt-3">
            <BrandLogo size="sm" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Panel de administración</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {DASHBOARD_SECTIONS.map((section) => {
            const isActive = pathname.startsWith(section.href);

            return (
              <Link
                key={section.id}
                href={section.href}
                className={`block w-full rounded-lg px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-[#00FF00] text-black"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {section.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/sign-in";
            }}
            className="w-full rounded-lg border border-white/20 px-4 py-2.5 text-sm text-gray-300 hover:border-red-500/50 hover:text-red-400 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="border-b border-white/10 bg-black/80 px-8 py-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-white">{activeMeta.label}</h2>
          <p className="text-sm text-gray-500 mt-1">{activeMeta.description}</p>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
