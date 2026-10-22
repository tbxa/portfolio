import { ArrowUpRightIcon, FileTextIcon, MailIcon, MapPinIcon } from "lucide-react";

import { CopyButton } from "@/components/public/copy-button";
import { Section } from "@/components/public/section";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/shared/brand-icons";
import { Reveal } from "@/components/shared/reveal";
import { displayUrl, whatsappLink } from "@/lib/format";
import type { Profile, SiteSettings } from "@/types";

type Channel = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  external: boolean;
  copy?: string;
};

export function Contact({
  profile,
  settings,
  index,
}: {
  profile: Profile;
  settings: SiteSettings;
  index: number;
}) {
  const wa = settings.show_whatsapp ? whatsappLink(profile.whatsapp) : null;
  const channels: Channel[] = [
    profile.email && {
      label: "E-mail",
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: <MailIcon className="size-4" />,
      external: false,
      copy: profile.email,
    },
    profile.linkedin_url && {
      label: "LinkedIn",
      value: displayUrl(profile.linkedin_url),
      href: profile.linkedin_url,
      icon: <LinkedInIcon className="size-4" />,
      external: true,
    },
    profile.github_url && {
      label: "GitHub",
      value: displayUrl(profile.github_url),
      href: profile.github_url,
      icon: <GitHubIcon className="size-4" />,
      external: true,
    },
    wa && {
      label: "WhatsApp",
      value: profile.whatsapp,
      href: wa,
      icon: <WhatsAppIcon className="size-4" />,
      external: true,
    },
  ].filter(Boolean) as Channel[];

  return (
    <Section
      id="contato"
      index={index}
      title="Contato"
      description="Estou disponível para conversar sobre oportunidades e processos seletivos. O e-mail é o canal mais rápido."
    >
      <Reveal className="grid gap-3 sm:grid-cols-2">
        {channels.map((c) => (
          <div
            key={c.label}
            className="group relative flex items-center gap-4 rounded-xl border bg-card/50 p-4 transition-colors hover:border-foreground/20"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground group-hover:text-foreground">
              {c.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="block truncate font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
              >
                {c.value}
                {c.external && <span className="sr-only"> (abre em nova aba)</span>}
              </a>
            </div>
            {c.copy ? (
              <CopyButton value={c.copy} label={`Copiar ${c.label.toLowerCase()}`} className="relative z-10" />
            ) : (
              <ArrowUpRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.05} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {settings.show_location && profile.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="size-4" aria-hidden="true" /> {profile.location}
          </span>
        )}
        {profile.resume_path && (
          <a
            href="/curriculo"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <FileTextIcon className="size-4" aria-hidden="true" /> Currículo em PDF
          </a>
        )}
      </Reveal>
    </Section>
  );
}
