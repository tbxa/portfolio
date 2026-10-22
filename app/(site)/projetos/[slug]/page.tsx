import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CalendarIcon, FolderIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectGallery } from "@/components/public/project-gallery";
import { GitHubIcon } from "@/components/shared/brand-icons";
import { JsonLd } from "@/components/shared/json-ld";
import { RichText } from "@/components/shared/rich-text";
import { TechIcon } from "@/components/shared/tech-icon";
import { buttonVariants } from "@/components/ui/button";
import { getProfile, getProjectBySlug, getPublishedProjects, getTechCategories } from "@/lib/data/public";
import { publicEnv } from "@/lib/env";
import { hostname, toLines } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Technology } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Projeto não encontrado", robots: { index: false } };

  const description = project.short_description || project.description.slice(0, 160) || undefined;
  const cover = storageUrl(project.cover_path);
  return {
    title: project.name,
    description,
    alternates: { canonical: `/projetos/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.name,
      description,
      url: `/projetos/${project.slug}`,
      ...(cover ? { images: [{ url: cover, alt: project.cover_alt || project.name }] } : {}),
    },
  };
}

const CASE_STUDY: Array<{ key: "description" | "goal" | "problem" | "role" | "challenges" | "solutions" | "architecture"; title: string }> = [
  { key: "description", title: "Sobre o projeto" },
  { key: "goal", title: "Objetivo" },
  { key: "problem", title: "Problema resolvido" },
  { key: "role", title: "Minha participação" },
  { key: "challenges", title: "Desafios técnicos" },
  { key: "solutions", title: "Soluções adotadas" },
  { key: "architecture", title: "Arquitetura e abordagem técnica" },
];

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, techCategories, allProjects, profile] = await Promise.all([
    getProjectBySlug(slug),
    getTechCategories(),
    getPublishedProjects(),
    getProfile(),
  ]);
  if (!project) notFound();

  const cover = storageUrl(project.cover_path);
  const features = toLines(project.features);
  const integrations = toLines(project.integrations);
  const sections = CASE_STUDY.filter((s) => project[s.key].trim());

  // Stack agrupada pelas categorias de tecnologia (Frontend, Backend, Banco de dados…).
  const stack = [
    ...techCategories.map((c) => ({
      name: c.name,
      items: project.technologies.filter((t) => t.category_id === c.id),
    })),
    {
      name: "Outras",
      items: project.technologies.filter(
        (t) => !t.category_id || !techCategories.some((c) => c.id === t.category_id)
      ),
    },
  ].filter((g) => g.items.length > 0);

  const position = allProjects.findIndex((p) => p.id === project.id);
  const prev = position > 0 ? allProjects[position - 1] : null;
  const next = position >= 0 && position < allProjects.length - 1 ? allProjects[position + 1] : null;

  return (
    <article className="pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.name,
          description: project.short_description || undefined,
          url: `${publicEnv.siteUrl}/projetos/${project.slug}`,
          image: cover ?? undefined,
          dateCreated: project.year ? String(project.year) : undefined,
          author: profile.full_name ? { "@type": "Person", name: profile.full_name } : undefined,
          keywords: project.technologies.map((t) => t.name).join(", ") || undefined,
          ...(project.repo_url ? { codeRepository: project.repo_url } : {}),
        }}
      />

      <header className="relative isolate overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_80%_at_50%_0%,#000_30%,transparent_100%)]"
        />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
          <Link
            href="/#projetos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" /> Todos os projetos
          </Link>
          <div className="animate-in duration-500 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none">
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
              {project.category && (
                <span className="inline-flex items-center gap-1.5">
                  <FolderIcon className="size-3.5" aria-hidden="true" /> {project.category.name}
                </span>
              )}
              {project.year && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" aria-hidden="true" /> {project.year}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{project.name}</h1>
            {project.short_description && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
                {project.short_description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {project.site_url && (
                <a
                  href={project.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
                >
                  Visualizar aplicação
                  <ArrowUpRightIcon data-icon="inline-end" />
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              )}
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
                >
                  <GitHubIcon data-icon="inline-start" className="size-4" />
                  Repositório no GitHub
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {cover && (
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-muted shadow-2xl shadow-black/10">
            <Image
              src={cover}
              alt={project.cover_alt || `Tela principal do projeto ${project.name}`}
              fill
              priority
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      )}

      <div className="mx-auto mt-14 grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-12">
          {sections.map((section) => (
            <section key={section.key} aria-labelledby={`sec-${section.key}`}>
              <h2 id={`sec-${section.key}`} className="mb-4 text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <RichText text={project[section.key]} />
            </section>
          ))}

          {features.length > 0 && (
            <section aria-labelledby="sec-features">
              <h2 id="sec-features" className="mb-4 text-xl font-semibold tracking-tight">
                Funcionalidades implementadas
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex gap-2.5 rounded-lg border bg-card/50 px-4 py-3 text-sm">
                    <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.images.length > 0 && (
            <section aria-labelledby="sec-gallery">
              <h2 id="sec-gallery" className="mb-4 text-xl font-semibold tracking-tight">
                Galeria
              </h2>
              <ProjectGallery images={project.images} projectName={project.name} />
            </section>
          )}

          {sections.length === 0 && features.length === 0 && project.images.length === 0 && (
            <p className="text-muted-foreground">
              Os detalhes técnicos deste projeto ainda estão sendo documentados.
              {project.site_url && " Enquanto isso, você pode acessar a aplicação publicada."}
            </p>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start" aria-label="Ficha técnica">
          {stack.length > 0 && (
            <div>
              <h2 className="mb-4 font-mono text-xs tracking-wider text-muted-foreground uppercase">Stack</h2>
              <dl className="space-y-4">
                {stack.map((group) => (
                  <div key={group.name}>
                    <dt className="mb-2 text-sm font-medium">{group.name}</dt>
                    <dd>
                      <TechList items={group.items} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {integrations.length > 0 && (
            <div>
              <h2 className="mb-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                Integrações externas
              </h2>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {integrations.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="mb-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">Links</h2>
            <ul className="space-y-2 text-sm">
              {project.site_url && (
                <li>
                  <a
                    href={project.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:underline"
                  >
                    {hostname(project.site_url)} <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                  </a>
                </li>
              )}
              {project.repo_url ? (
                <li>
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:underline"
                  >
                    <GitHubIcon className="size-3.5" /> Código-fonte
                  </a>
                </li>
              ) : (
                <li className="text-muted-foreground">Repositório privado</li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      {(prev || next) && (
        <nav aria-label="Outros projetos" className="mx-auto mt-20 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6">
          {prev ? (
            <Link
              href={`/projetos/${prev.slug}`}
              className="group rounded-xl border p-5 transition-colors hover:border-foreground/20"
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowLeftIcon className="size-3.5" aria-hidden="true" /> Anterior
              </span>
              <span className="mt-1 block font-medium">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/projetos/${next.slug}`}
              className="group rounded-xl border p-5 text-right transition-colors hover:border-foreground/20"
            >
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                Próximo <ArrowRightIcon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="mt-1 block font-medium">{next.name}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

function TechList({ items }: { items: Technology[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t.id} className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
          <TechIcon name={t.name} icon={t.icon} className="size-3" />
          {t.name}
        </li>
      ))}
    </ul>
  );
}
