import { supabaseAdmin } from "@/lib/supabase";

export default async function AdminDashboardPage() {
  const [
    { count: noticeCount },
    { count: galleryCount },
    { count: bannerCount },
    { data: latest = [] },
  ] = await Promise.all([
    supabaseAdmin.from("notices").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("gallery_posts").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("banners").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("notices").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">대시보드</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="공지사항" value={noticeCount ?? 0} />
        <StatCard label="갤러리 글" value={galleryCount ?? 0} />
        <StatCard label="배너" value={bannerCount ?? 0} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">최근 등록 공지사항</h2>
        <ul className="space-y-2 text-sm">
          {(latest ?? []).map((n: any) => (
            <li key={n.id} className="flex justify-between">
              <span>{n.title}</span>
              <span className="text-slate-500">{new Date(n.created_at).toLocaleDateString("ko-KR")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
    </div>
  );
}
