import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Boxes,
  CalendarClock,
  ClipboardList,
  Coffee,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Newspaper,
  PauseCircle,
  Users
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getLoginSettings } from "@/lib/data";
import { getSession } from "@/lib/session";
import { canAccess, dashboardForRole, roleLabels } from "@/lib/permissions";

const nav = [
  { href: "/gestor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/garcom", label: "Meu painel", icon: ClipboardList },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/usuarios", label: "Usuários", icon: Users },
  { href: "/tarefas", label: "Tarefas", icon: ClipboardList },
  { href: "/pracas", label: "Praças", icon: MapPinned },
  { href: "/escalas", label: "Escalas", icon: CalendarClock },
  { href: "/descansos", label: "Descansos", icon: PauseCircle },
  { href: "/fichas", label: "Fichas", icon: Coffee },
  { href: "/pedidos", label: "Pedidos", icon: Boxes },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/historico", label: "Histórico", icon: History }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getLoginSettings()]);
  if (!session) redirect("/login");

  const items = nav.filter((item) => canAccess(item.href, session.role));
  const brandName = settings.loginEyebrow || "AEB Restaurante";
  const brandSubtitle = settings.loginTitle || "Sistema de operações";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/80 backdrop-blur lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          {settings.loginLogoUrl ? (
            <img src={settings.loginLogoUrl} alt={brandName} className="size-9 rounded-md object-contain" />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">{brandName.slice(0, 1).toUpperCase()}</div>
          )}
          <div>
            <p className="max-w-[170px] truncate text-sm font-semibold">{brandName}</p>
            <p className="max-w-[170px] truncate text-xs text-muted-foreground">{brandSubtitle}</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:px-6">
          <div>
            <p className="text-sm font-medium">{roleLabels[session.role]}</p>
            <p className="text-xs text-muted-foreground">{session.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notificações">
              <Bell className="size-4" />
            </Button>
            <ThemeToggle />
            <Avatar>
              <AvatarFallback>{session.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <form action={logoutAction}>
              <Button variant="ghost" size="icon" aria-label="Sair">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card p-1 lg:hidden">
        {items.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-md p-2 text-[11px] text-muted-foreground">
            <item.icon className="size-4" />
            {item.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
