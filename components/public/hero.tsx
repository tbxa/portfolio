import { ArrowDownIcon, FileTextIcon } from "lucide-react";

import { GitHubIcon } from "@/components/shared/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

export function Hero({ profile, hasProjects }: { profile: Profile; hasProjects: boolean }) {
  const name = profile.full_name || "Desenvolvedor de Software";
  const role = profile.role_title || (profile.full_name ? "Desenvolvedor de Software" : "");
  const title = profile.hero_title || (profile.full_name ? `Olá, eu sou ${profile.full_name}.` : name);

  return (
    <section id="inicio" aria-labelledby="inicio-title" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
        <div className="animate-in duration-700 fade-in-0 slide-in-from-bottom-3 motion-reduce:animate-none">
          {role && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
              {role}
            </p>
          )}
          <h1
            id="inicio-title"
            className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>
          {profile.hero_subtitle && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
              {profile.hero_subtitle}
            </p>
          )}
        </div>

        <div className="mt-10 flex animate-in flex-wrap gap-3 delay-150 duration-700 fill-mode-backwards fade-in-0 slide-in-from-bottom-3 motion-reduce:animate-none">
          {hasProjects && (
            <a href="#projetos" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
              Ver meus projetos
              <ArrowDownIcon data-icon="inline-end" />
            </a>
          )}
          {profile.resume_path && (
            <a
              href="/curriculo"
              target="_blank"
              rel="noopener"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
            >
              <FileTextIcon data-icon="inline-start" />
              Visualizar currículo
            </a>
          )}
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 px-5")}
            >
              <GitHubIcon data-icon="inline-start" className="size-4" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
