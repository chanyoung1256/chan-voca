import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chan Voca | 토익 영단어",
  description: "토익 영단어 암기 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        className={inter.className}
        style={{ backgroundColor: "#f8fafc", margin: 0, padding: 0 }}
      >
        <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
