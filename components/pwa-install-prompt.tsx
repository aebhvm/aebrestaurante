"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isRunningStandalone()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => setVisible(false);

  const install = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setVisible(false);
    } finally {
      setInstallPrompt(null);
    }
  };

  if (!visible || !installPrompt) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-lg sm:inset-x-auto sm:right-4 sm:w-[min(25rem,calc(100vw-2rem))]" role="dialog" aria-label="Instalar aplicativo">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Download className="size-5" />
      </div>
      <p className="min-w-0 flex-1 text-sm font-semibold">Use o AEB Restaurante como app</p>
      <Button type="button" size="sm" onClick={install}>
        Instalar app
      </Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Fechar convite de instalacao" onClick={dismiss}>
        <X className="size-4" />
      </Button>
    </aside>
  );
}
