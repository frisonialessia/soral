import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/lib/providers";
import { SessionProvider } from "@/lib/auth/session";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soral",
  description: "Soral — predicción de continuidad operativa para maquilas",
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
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <SessionProvider>
              <AppShell>{children}</AppShell>
            </SessionProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
