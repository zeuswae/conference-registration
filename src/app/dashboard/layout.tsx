import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="dashboard-shell">
      <DashboardNav user={session} />
      <main className="mx-auto max-w-7xl px-5 py-8 md:py-10">{children}</main>
    </div>
  );
}
