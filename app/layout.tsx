import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const iconUrl = "/api/pwa-icon";

  return {
    title: "AEB Restaurante",
    description: "Gestão profissional de operações para restaurantes e bares",
    icons: {
      icon: [
        { url: `${iconUrl}?size=192`, sizes: "192x192", type: "image/png" },
        { url: `${iconUrl}?size=512`, sizes: "512x512", type: "image/png" }
      ],
      apple: { url: `${iconUrl}?size=180`, sizes: "180x180", type: "image/png" }
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="aeb-theme-v2">
          {children}
        </ThemeProvider>
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
