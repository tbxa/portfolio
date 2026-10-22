"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { id: "inicio", label: "Início" },
  { id: "sobre", label: "Sobre mim" },
  { id: "tecnologias", label: "Tecnologias" },
  { id: "projetos", label: "Projetos" },
  { id: "experiencia", label: "Experiência" },
  { id: "contato", label: "Contato" },
] as const;

/** Destaca no menu a seção visível na tela. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>("inicio");
  useEffect(() => {
    if (!enabled) return;
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

export function SiteHeader({
  name,
  githubUrl,
  linkedinUrl,
}: {
  name: string;
  githubUrl: string;
  linkedinUrl: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const brand = name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toLowerCase()
    : "dev";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors",
        scrolled ? "border-border bg-background/80 backdrop-blur-md" : "border-transparent"
      )}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight" aria-label="Página inicial">
          <span className="text-brand">~/</span>
          {brand}
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={href(item.id)}
                  aria-current={isHome && active === item.id ? "true" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    isHome && active === item.id && "text-foreground"
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (abre em nova aba)"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <GitHubIcon className="size-4" />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (abre em nova aba)"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <LinkedInIcon className="size-4" />
            </a>
          )}
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                  <MenuIcon />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-mono text-sm">
                  <span className="text-brand">~/</span>menu
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Principal (celular)" className="px-4">
                <ul className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={href(item.id)}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
