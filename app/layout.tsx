import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// TODO: 도메인 확정 후 metadataBase URL 업데이트
const SITE_URL = "https://bethelviet.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "사이공베델교회 | 말씀으로 회복되는 교회",
  description: '2026 교회 표어, "주의 말씀은 내 발의 등이요 내 길의 빛이니이다(시편 119:105)"를 중심으로 말씀 안에서 회복과 예배를 세워가는 사이공베델교회입니다.',
  icons: {
    icon: [
      { url: "/favicon.ico/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico/favicon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/favicon.ico/apple-icon.png" },
      { url: "/favicon.ico/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "사이공베델교회 | 말씀으로 회복되는 교회",
    description: '2026 교회 표어, "주의 말씀은 내 발의 등이요 내 길의 빛이니이다(시편 119:105)"를 중심으로 말씀 안에서 회복과 예배를 세워가는 사이공베델교회입니다.',
    siteName: "사이공베델교회",
    images: [{ url: "/images/og_image_church.jpg", width: 1200, height: 630, alt: "사이공베델교회" }],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "사이공베델교회 | 말씀으로 회복되는 교회",
    description: '2026 교회 표어, "주의 말씀은 내 발의 등이요 내 길의 빛이니이다(시편 119:105)"를 중심으로 말씀 안에서 회복과 예배를 세워가는 사이공베델교회입니다.',
    images: ["/images/og_image_church.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.variable}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
