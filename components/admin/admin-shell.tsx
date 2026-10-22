"use client";

import {
  BriefcaseIcon,
  CpuIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanbanIcon },
  { href: "/admin/tecnologias", label: "Tecnologias", icon: CpuIcon },
  { href: "/admin/perfil", label: "Perfil", icon: UserRoundIcon },
  { href: "/admin/trajetoria", label: "Experiência e formação", icon: BriefcaseIcon },
  { href: "/admin/curriculo", label: "Currículo", icon: FileTextIcon },
  { href: "/admin/configuracoes", label: "Configurações", icon: SettingsIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const footer = (
    <div className="space-y-1 border-t p-3">
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      >
        <ExternalLinkIcon className="size-4" aria-hidden="true" /> Ver portfólio
      </a>
      <div className="flex items-center justify-between gap-2 px-2.5 pt-1">
        <span className="truncate text-xs text-muted-foreground" title={email}>
          {email}
        </span>
        <div className="flex shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
            <LogOutIcon />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center px-5 font-mono text-sm font-medium">
          <span className="text-brand">~/</span>admin
        </div>
        <nav aria-label="Painel" className="flex-1 overflow-y-auto px-3">
          <NavLinks />
        </nav>
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:hidden">
          <span className="font-mono text-sm font-medium">
            <span className="text-brand">~/</span>admin
          </span>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Abrir menu do painel">
                  <MenuIcon />
                </Button>
              }
            />
            <SheetContent side="left" className="flex w-72 flex-col gap-0 bg-sidebar p-0">
              <SheetHeader className="h-14 justify-center px-5">
                <SheetTitle className="font-mono text-sm">
                  <span className="text-brand">~/</span>admin
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Painel (celular)" className="flex-1 overflow-y-auto px-3">
                <NavLinks onNavigate={() => setOpen(false)} />
              </nav>
              {footer}
            </SheetContent>
          </Sheet>
        </header>
        <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
