import { notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { verifyDashboardAdminAccess } from "@/lib/dashboard/verify-admin-access";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await verifyDashboardAdminAccess();

  if (!isAdmin) {
    notFound();
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
