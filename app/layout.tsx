import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soral",
  description: "Soral — predicción de continuidad operativa para maquilas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Providers>
          <TopBar />
          <main className="mx-auto max-w-[1120px] px-[30px]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
