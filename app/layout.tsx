import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/lib/providers";
import { SessionProvider } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://soral-nu.vercel.app"),
  title: {
    default: "Soral — Predictive retention for manufacturing",
    template: "%s · Soral",
  },
  description:
    "Soral scores each worker for 30-day turnover risk, explains why, and hands supervisors the play to retain them — built for maquiladoras.",
  applicationName: "Soral",
  openGraph: {
    type: "website",
    siteName: "Soral",
    title: "Predict who's leaving — and how to keep them.",
    description:
      "Predictive retention for manufacturing: explainable risk scores and retention plays, a week before they walk. Built for maquiladoras.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soral — Predictive retention for manufacturing",
    description: "Explainable turnover risk scores and retention plays for the factory floor.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <SessionProvider>{children}</SessionProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
