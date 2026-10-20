import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SJACS PTA Parent Election",
  description: "SJACS Parent-Teacher Association parent committee election voting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
        <footer className="site-footer">© SJACS Parent-Teacher Association</footer>
      </body>
    </html>
  );
}
