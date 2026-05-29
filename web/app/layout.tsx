import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "쿠팡 리뷰라이터 | 인기상품 리뷰 블로그 작성 도구",
  description: "쿠팡 인기 상품을 검색하고, 파트너스 링크를 관리하며, AI로 네이버·티스토리용 전문 리뷰 글을 빠르게 작성하세요. 복사 한 번으로 블로그에 붙여넣기.",
  icons: {
    icon: "/next.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#171717]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
