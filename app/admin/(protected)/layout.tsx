import { getAuthSession } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <AdminSidebar />
        <section className="flex-1 p-4 md:p-6">{children}</section>
      </div>
    </div>
  );
}
