import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const BASE = "https://whichpersonality.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Free Personality Test — Discover Your 4-Letter MBTI Type",
    template: "%s | WhichPersonality",
  },
  description:
    "Take the free 60-question personality test and discover your 4-letter personality type. Get a deep-dive profile covering your strengths, work style, relationships, stress patterns and compatible types.",
  keywords:
    "personality test, MBTI type, free personality test, 16 personality types, personality type test, find your type, introvert extravert, personality profile, psychometric test",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "WhichPersonality",
    title: "Free Personality Test — Discover Your 4-Letter Type",
    description:
      "A 3-minute personality inventory that reveals your 4-letter type and a deep-dive profile. 60 questions, 16 types.",
    url: BASE,
    images: [{ url: `${BASE}/og.png`, width: 1200, height: 630, alt: "WhichPersonality — free personality test" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Personality Test — Discover Your 4-Letter Type",
    description:
      "A 3-minute personality inventory that reveals your 4-letter type and a deep-dive profile.",
    site: "@whichpersonality",
    creator: "@whichpersonality",
    images: [`${BASE}/og.png`],
  },
  alternates: {
    canonical: BASE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18358280505"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18358280505');
            `,
          }}
        />
      </head>
      <body className="bg-[var(--color-bg-0)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
