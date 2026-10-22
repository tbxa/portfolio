import { CheckCircle2Icon, CircleIcon, ImageIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAdminProfile, listProjects, listTechnologies } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { storageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [projects, technologies, profile] = await Promise.all([listProjects(), listTechnologies(), getAdminProfile()]);
  const published = projects.filter((p) => p.status === "published").length;
  const recent = [...projects].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5);

  const stats = [
    { label: "Total de projetos", value: projects.length },
    { label: "Publicados", value: published },
    { label: "Rascunhos", value: projects.length - published },
    { label: "Tecnologias", value: technologies.length, hint: `${technologies.filter((t) => t.visible).length} visíveis` },
  ];

  const checklist = [
    { done: Boolean(profile.full_name && profile.role_title), label: "Nome e cargo no perfil", href: "/admin/perfil" },
    { done: Boolean(profile.hero_subtitle || profile.summary), label: "Apresentação e resumo profissional", href: "/admin/perfil" },
    { done: Boolean(profile.email || profile.linkedin_url), label: "Informações de contato", href: "/admin/perfil" },
    { done: technologies.some((t) => t.visible), label: "Confirmar suas tecnologias (deixar visíveis)", href: "/admin/tecnologias" },
    { done: Boolean(profile.resume_path), label: "Enviar currículo em PDF", href: "/admin/curriculo" },
    { done: published > 0, label: "Publicar o primeiro projeto", href: "/admin/projetos/novo" },
  ];
  const pending = checklist.filter((c) => !c.done);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu portfólio."
        actions={
          <Link href="/admin/projetos/novo" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
            <PlusIcon data-icon="inline-start" /> Novo projeto
          </Link>
        }
      />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{s.value}</dd>
            {s.hint && <dd className="text-xs text-muted-foreground">{s.hint}</dd>}
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Projetos recentes</h2>
            <Link href="/admin/projetos" className="text-sm text-muted-foreground hover:text-foreground">
              Ver todos
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhum projeto ainda.{" "}
              <Link href="/admin/projetos/novo" className="font-medium text-foreground underline underline-offset-4">
                Cadastre o primeiro
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((p) => {
                const cover = storageUrl(p.cover_path);
                return (
                  <li key={p.id}>
                    <Link href={`/admin/projetos/${p.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40">
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded border bg-muted">
                        {cover ? (
                          <Image src={cover} alt="" fill sizes="64px" className="object-cover object-top" />
                        ) : (
                          <ImageIcon className="m-auto mt-2.5 size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Atualizado em {formatDate(p.updated_at)}</p>
                      </div>
                      <Badge variant={p.status === "published" ? "default" : "secondary"}>
                        {p.status === "published" ? "Publicado" : "Rascunho"}
                      </Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Primeiros passos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending.length === 0 ? "Tudo pronto! Seu portfólio está completo." : `${checklist.length - pending.length} de ${checklist.length} concluídos.`}
          </p>
          <ul className="mt-4 space-y-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50",
                    item.done && "text-muted-foreground line-through decoration-muted-foreground/40"
                  )}
                >
                  {item.done ? (
                    <CheckCircle2Icon className="size-4 shrink-0 text-brand" aria-label="Concluído" />
                  ) : (
                    <CircleIcon className="size-4 shrink-0 text-muted-foreground" aria-label="Pendente" />
                  )}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
