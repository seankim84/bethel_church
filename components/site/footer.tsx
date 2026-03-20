import { getSettingsMap } from "@/lib/site";

export async function SiteFooter() {
  const s = await getSettingsMap();
  return (
    <footer className="border-t border-slate-200 py-10">
      <div className="container-page flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-navy">{s.church_name}</p>
          <p>{s.address}</p>
          <p>{s.phone}</p>
          <p>email: chowook78@hanmail.net</p>
        </div>
        <p className="text-slate-400 sm:text-right">© 2026 Bethel. All rights reserved.</p>
      </div>
    </footer>
  );
}
