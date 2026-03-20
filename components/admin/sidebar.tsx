"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const menus = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/banners", label: "배너 관리" },
  { href: "/admin/sermon", label: "설교 영상 설정" },
  { href: "/admin/worship", label: "예배 안내 관리" },
  { href: "/admin/notices", label: "공지사항 관리" },
  { href: "/admin/gallery", label: "갤러리 관리" },
  { href: "/admin/settings", label: "기본 정보 관리" }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-slate-200 bg-white md:w-64">
      <div className="p-4 text-lg font-bold text-navy">관리자</div>
      <nav className="space-y-1 px-2">
        {menus.map((m) => (
          <Link key={m.href} href={m.href} className={`block rounded px-3 py-2 text-sm ${pathname === m.href ? "bg-navy text-white" : "hover:bg-slate-100"}`}>
            {m.label}
          </Link>
        ))}
      </nav>
      <div className="p-3">
        <button className="w-full rounded bg-slate-100 px-3 py-2 text-sm" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
