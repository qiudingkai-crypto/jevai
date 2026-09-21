import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Jev Verdict — Ask questions about any text. Get probabilities, not prose.",
  description:
    "Jev is a TypeSafe System One model that answers yes/no, choice and score questions about any text — with calibrated confidence.",
  openGraph: {
    title: "Jev Verdict — Get probabilities, not prose.",
    description: "TypeSafe System One model for decision questions about any text.",
    type: "website",
    url: "https://jev-ai.xyz",
    siteName: "Jev Verdict",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%232f6bff'/%3E%3Ctext x='32' y='46' font-family='Georgia,serif' font-size='38' font-weight='bold' fill='white' text-anchor='middle' font-style='italic'>J</text%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://miaoda.feishu.cn/fonts/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
