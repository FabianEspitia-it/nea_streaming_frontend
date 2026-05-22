export type DashboardSectionId = "users" | "accounts" | "requests";

export const DASHBOARD_SECTIONS: {
  id: DashboardSectionId;
  href: string;
  label: string;
  description: string;
}[] = [
  {
    id: "users",
    href: "/dashboard/users",
    label: "Usuarios",
    description: "Alta, listado y baja",
  },
  {
    id: "accounts",
    href: "/dashboard/accounts",
    label: "Cuentas",
    description: "Bulk, vínculos y listado",
  },
  {
    id: "requests",
    href: "/dashboard/requests",
    label: "Solicitudes",
    description: "Historial de peticiones",
  },
];

export function getDashboardSection(pathname: string) {
  return (
    DASHBOARD_SECTIONS.find((section) => pathname.startsWith(section.href)) ??
    DASHBOARD_SECTIONS[0]
  );
}
