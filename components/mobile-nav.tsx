"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, CalendarClock, ClipboardList, Coffee, LayoutDashboard, Menu, Newspaper, PauseCircle, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const icons = { Boxes, CalendarClock, ClipboardList, Coffee, LayoutDashboard, Newspaper, PauseCircle, Users };

type MobileItem = { href: string; label: string; iconName: keyof typeof icons };

export function MobileNav({ items, brandName, brandSubtitle, logoUrl }: { items: MobileItem[]; brandName: string; brandSubtitle: string; logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <Button type="button" variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu className="size-5" /></Button>
      {open && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/45" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,320px)] border-r bg-card text-card-foreground shadow-xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b px-4">
          {logoUrl ? <img src={logoUrl} alt={brandName} className="size-9 rounded-md object-contain" /> : <div className="flex size-9 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">{brandName.slice(0, 1).toUpperCase()}</div>}
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{brandName}</p><p className="truncate text-xs text-muted-foreground">{brandSubtitle}</p></div>
          <Button type="button" variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setOpen(false)}><X className="size-5" /></Button>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = icons[item.iconName];
            const active = pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon className="size-4" />{item.label}</Link>;
          })}
        </nav>
      </aside>
    </div>
  );
}
