import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SC Briefer | 학교생활·진로 데이터 브리퍼",
  description:
    "NEIS·학교알리미·커리어넷 공개정보를 교사 승인형 주간 브리핑으로 구성하는 실행 데모입니다.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
