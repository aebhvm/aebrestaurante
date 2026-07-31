import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { getLoginSettings } from "@/lib/data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLoginSettings();
  const iconUrl = settings.loginLogoUrl || "/aeb-icon.svg";

  return {
    title: "AEB Restaurante",
    description: "Gestão profissional de operações para restaurantes e bares",
    icons: {
      icon: iconUrl,
      apple: iconUrl
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
