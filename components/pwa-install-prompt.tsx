"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isMobileDevice() {
  return window.matchMedia("(max-width: 767px)").matches || /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isRunningStandalone()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => setVisible(false);
    const showTimer = window.setTimeout(() => setVisible(true), 700);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (isIosDevice()) setIos(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => setVisible(false);

  const install = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setVisible(false);
    } finally {
      setInstallPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-lg sm:inset-x-auto sm:right-4 sm:w-[min(25rem,calc(100vw-2rem))]" role="dialog" aria-label="Instalar aplicativo">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        {ios ? <Share className="size-5" /> : <Download className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Use o AEB Restaurante como app</p>
        <p className="text-xs text-muted-foreground">
          {ios
            ? "Toque em Compartilhar e depois em Adicionar à Tela de Início."
            : showInstructions
              ? "Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial."
              : "Instale no celular para abrir mais rápido."}
        </p>
      </div>
      {!ios && (
        <Button type="button" size="sm" onClick={install}>
          {installPrompt ? "Instalar" : "Como instalar"}
        </Button>
      )}
      <Button type="button" variant="ghost" size="icon" aria-label="Fechar convite de instalação" onClick={dismiss}>
        <X className="size-4" />
      </Button>
    </aside>
  );
}
