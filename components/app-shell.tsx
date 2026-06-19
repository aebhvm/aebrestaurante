import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Boxes,
  CalendarClock,
  ClipboardList,
  Coffee,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PauseCircle,
  Users
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { getLoginSettings } from "@/lib/data";
import { getSession } from "@/lib/session";
import { canAccess, dashboardForRole, roleLabels } from "@/lib/permissions";

const nav = [
  { href: "/gestor", label: "Dashboard", icon: LayoutDashboard, iconName: "LayoutDashboard", roles: ["gestor"] },
  { href: "/garcom", label: "Meu painel", icon: ClipboardList, iconName: "ClipboardList", roles: ["garcom", "barman"] },
  { href: "/estoque", label: "Estoque", icon: Boxes, iconName: "Boxes", roles: ["gestor", "estoquista"] },
  { href: "/usuarios", label: "Usuários", icon: Users, iconName: "Users", roles: ["gestor"] },
  { href: "/tarefas", label: "Tarefas", icon: ClipboardList, iconName: "ClipboardList", roles: ["gestor"] },
  { href: "/escalas", label: "Escalas", icon: CalendarClock, iconName: "CalendarClock", roles: ["gestor"] },
  { href: "/descansos", label: "Descansos", icon: PauseCircle, iconName: "PauseCircle", roles: ["gestor"] },
  { href: "/fichas", label: "Fichas", icon: Coffee, iconName: "Coffee", roles: ["gestor", "garcom", "barman"] },
  { href: "/pedidos", label: "Pedidos", icon: Boxes, iconName: "Boxes", roles: ["gestor", "barman", "estoquista"] },
  { href: "/noticias", label: "Notícias", icon: Newspaper, iconName: "Newspaper", roles: ["gestor", "garcom", "barman"] }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([getSession(), getLoginSettings()]);
  if (!session) redirect("/login");

  const items = nav.filter((item) => item.roles.includes(session.role) && canAccess(item.href, session.role));
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
          <div className="flex min-w-0 items-center gap-2">
            <MobileNav items={items.map(({ href, label, iconName }) => ({ href, label, iconName: iconName as "Boxes" | "CalendarClock" | "ClipboardList" | "Coffee" | "LayoutDashboard" | "Newspaper" | "PauseCircle" | "Users" }))} brandName={brandName} brandSubtitle={brandSubtitle} logoUrl={settings.loginLogoUrl} />
            <div className="min-w-0"><p className="truncate text-sm font-medium">{roleLabels[session.role]}</p><p className="truncate text-xs text-muted-foreground">{session.name}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notificações" className="hidden sm:inline-flex">
              <Bell className="size-4" />
            </Button>
            <ThemeToggle />
            <Avatar className="hidden sm:flex">
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
    </div>
  );
}
