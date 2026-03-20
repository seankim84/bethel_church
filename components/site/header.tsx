"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const menu = [
  { href: "/", label: "홈" },
  { href: "/about", label: "소개" },
  { href: "/sermon", label: "말씀" },
  { href: "/news", label: "소식" },
  { href: "/gallery", label: "갤러리" },
  { href: "/location", label: "오시는 길" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => { setOpen(false); }, [pathname]);

  // 메뉴 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/bethel_logo.png"
              alt="베델교회 로고"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-base font-bold text-navy md:text-lg">사이공 베델교회</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-700 md:flex md:gap-7">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-navy ${
                  pathname === item.href ? "font-semibold text-navy" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 모바일 햄버거 버튼 */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* 모바일 드로어 메뉴 */}
      <div
        className={`fixed inset-x-0 z-30 bg-white transition-all duration-300 md:hidden ${
          open
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 pointer-events-none opacity-0"
        }`}
        style={{ top: "64px", bottom: 0, overflowY: "auto" }}
      >
        <nav className="flex flex-col px-6 pb-10 pt-3">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center border-b border-slate-100 py-4 text-lg font-medium transition-colors ${
                pathname === item.href
                  ? "text-navy"
                  : "text-slate-700"
              }`}
            >
              <span className={`mr-3 h-1.5 w-1.5 rounded-full ${pathname === item.href ? "bg-navy" : "bg-slate-300"}`} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* 오버레이 배경 */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          style={{ top: "64px" }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
