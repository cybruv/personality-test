import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discover Your Type — Personality Profile",
  description:
    "A 3-minute personality test that reveals your 4-letter type and a deep-dive profile. Free to take, detailed report available.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[var(--color-bg-0)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
