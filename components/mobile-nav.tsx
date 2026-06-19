"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Boxes, CalendarClock, ClipboardList, Coffee, LayoutDashboard, Menu, Newspaper, PauseCircle, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const icons = { Boxes, CalendarClock, ClipboardList, Coffee, LayoutDashboard, Newspaper, PauseCircle, Users };

type MobileItem = { href: string; label: string; iconName: keyof typeof icons };

export function MobileNav({ items, brandName, brandSubtitle, logoUrl }: { items: MobileItem[]; brandName: string; brandSubtitle: string; logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const drawer = open && mounted ? createPortal(
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,304px)] flex-col overflow-hidden border-r bg-background text-foreground shadow-2xl">
        <div className="flex min-h-20 items-center gap-3 border-b bg-card px-4 pt-[env(safe-area-inset-top)]">
          {logoUrl ? <img src={logoUrl} alt={brandName} className="size-10 shrink-0 rounded-md object-contain" /> : <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">{brandName.slice(0, 1).toUpperCase()}</div>}
          <div className="min-w-0 flex-1"><p className="truncate text-base font-semibold">{brandName}</p><p className="truncate text-xs text-muted-foreground">{brandSubtitle}</p></div>
          <Button type="button" variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setOpen(false)}><X className="size-5" /></Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto bg-background p-3">
          {items.map((item) => {
            const Icon = icons[item.iconName];
            const active = pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}><Icon className="size-5 shrink-0" />{item.label}</Link>;
          })}
        </nav>
        <p className="border-t bg-card px-4 py-3 text-xs text-muted-foreground">Selecione uma área para continuar</p>
      </aside>
    </div>,
    document.body
  ) : null;

  return (
    <div className="lg:hidden">
      <Button type="button" variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu className="size-5" /></Button>
      {drawer}
    </div>
  );
}
