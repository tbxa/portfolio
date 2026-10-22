"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ExternalLinkIcon, Loader2Icon, RocketIcon, SaveIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { describedBy, Field, FormSection, NativeSelect } from "@/components/admin/field";
import { GalleryManager, type GalleryItem } from "@/components/admin/gallery-manager";
import { ImageUpload } from "@/components/admin/image-upload";
import { TechPicker } from "@/components/admin/tech-picker";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveProject } from "@/lib/actions/projects";
import { slugify } from "@/lib/slug";
import { normalizeUrl, projectSchema, type ProjectInput, type ProjectValues } from "@/lib/validations";
import type { Category, ProjectStatus, ProjectWithRelations, Technology } from "@/types";

type CaseStudyKey = "description" | "goal" | "problem" | "features" | "role" | "challenges" | "solutions" | "architecture" | "integrations";

const CASE_STUDY_FIELDS: Array<{ key: CaseStudyKey; label: string; hint?: string; rows?: number }> = [
  { key: "description", label: "Descrição completa", rows: 5, hint: "Linha em branco separa parágrafos. Linhas com “- ” viram lista." },
  { key: "goal", label: "Objetivo do projeto" },
  { key: "problem", label: "Problema resolvido" },
  { key: "features", label: "Funcionalidades desenvolvidas", rows: 5, hint: "Uma funcionalidade por linha." },
  { key: "role", label: "Minha participação", hint: "O que você fez: frontend, backend, design, deploy…" },
  { key: "challenges", label: "Desafios técnicos" },
  { key: "solutions", label: "Soluções implementadas" },
  { key: "architecture", label: "Arquitetura ou abordagem técnica" },
  { key: "integrations", label: "Integrações externas", rows: 3, hint: "Uma por linha (ex.: Stripe, API do WhatsApp, Google Maps)." },
];

export function ProjectForm({
  project,
  technologies: initialTechnologies,
  techCategories,
  projectCategories,
  defaultSortOrder,
}: {
  project: ProjectWithRelations | null;
  technologies: Technology[];
  techCategories: Category[];
  projectCategories: Category[];
  defaultSortOrder: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState<ProjectStatus | null>(null);
  const [technologies, setTechnologies] = useState(initialTechnologies);
  const [gallery, setGallery] = useState<GalleryItem[]>(
    (project?.images ?? []).map((img) => ({ key: img.id, id: img.id, path: img.path, alt: img.alt, kind: img.kind }))
  );
  const [galleryDirty, setGalleryDirty] = useState(false);
  const isNew = !project;

  const form = useForm<ProjectInput, unknown, ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      slug: project?.slug ?? "",
      site_url: project?.site_url ?? "",
      repo_url: project?.repo_url ?? "",
      short_description: project?.short_description ?? "",
      category_id: project?.category_id ?? null,
      year: project?.year ?? new Date().getFullYear(),
      cover_path: project?.cover_path ?? null,
      cover_alt: project?.cover_alt ?? "",
      status: project?.status ?? "published",
      featured: project?.featured ?? false,
      sort_order: project?.sort_order ?? defaultSortOrder,
      description: project?.description ?? "",
      goal: project?.goal ?? "",
      problem: project?.problem ?? "",
      features: project?.features ?? "",
      role: project?.role ?? "",
      challenges: project?.challenges ?? "",
      solutions: project?.solutions ?? "",
      architecture: project?.architecture ?? "",
      integrations: project?.integrations ?? "",
      technology_ids: project?.technologies.map((t) => t.id) ?? [],
      images: [],
    },
  });
  const { register, control, handleSubmit, setValue, formState } = form;
  const errors = formState.errors;
  const [name, siteUrl, slug] = useWatch({ control, name: ["name", "site_url", "slug"] });
  const slugPreview = slug || slugify(name ?? "") || "nome-do-projeto";
  const isDirty = formState.isDirty || galleryDirty;
  const caseStudyValues = useWatch({ control, name: CASE_STUDY_FIELDS.map((f) => f.key) });
  const caseStudyFilled = caseStudyValues.filter((v) => (v ?? "").trim()).length;

  // Aviso ao sair com alterações não salvas.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function submit(status: ProjectStatus) {
    setValue("status", status);
    void handleSubmit(
      (values) => {
        setSubmitting(status);
        startTransition(async () => {
          const result = await saveProject(project?.id ?? null, {
            ...values,
            images: gallery.map(({ id, path, alt, kind }) => ({ id, path, alt, kind })),
          });
          setSubmitting(null);
          if (!result.ok) {
            toast.error(result.error);
            for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
              form.setError(field as keyof ProjectInput, { message: messages[0] });
            }
            return;
          }
          form.reset(values);
          setGalleryDirty(false);
          const viewAction =
            status === "published"
              ? { label: "Ver no site", onClick: () => window.open(`/projetos/${result.data.slug}`, "_blank") }
              : undefined;
          toast.success(
            status === "published"
              ? isNew
                ? "Projeto publicado! Já está visível no portfólio."
                : "Alterações publicadas."
              : "Rascunho salvo.",
            { action: viewAction }
          );
          if (isNew) router.push("/admin/projetos");
          else router.refresh();
        });
      },
      () => toast.error("Revise os campos destacados.")
    )();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit("published");
      }}
      noValidate
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/projetos" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Voltar para projetos">
            <ArrowLeftIcon />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{isNew ? "Novo projeto" : project.name}</h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground">
                <Badge variant={project.status === "published" ? "default" : "secondary"} className="mr-2">
                  {project.status === "published" ? "Publicado" : "Rascunho"}
                </Badge>
                {project.status === "published" && (
                  <a href={`/projetos/${project.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-foreground">
                    Ver no site <ExternalLinkIcon className="size-3" />
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={pending} onClick={() => submit("draft")}>
            {submitting === "draft" ? <Loader2Icon className="animate-spin" /> : <SaveIcon data-icon="inline-start" />}
            {isNew || project.status === "draft" ? "Salvar rascunho" : "Despublicar"}
          </Button>
          <Button type="submit" disabled={pending}>
            {submitting === "published" ? <Loader2Icon className="animate-spin" /> : <RocketIcon data-icon="inline-start" />}
            {isNew || project.status === "draft" ? "Publicar" : "Salvar e publicar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <FormSection title="Dados principais">
            <Field id="name" label="Nome do projeto" required error={errors.name?.message}>
              <Input {...register("name")} {...describedBy("name", errors.name?.message)} autoFocus={isNew} placeholder="Ex.: Sistema de agendamentos" />
            </Field>
            <Field
              id="site_url"
              label="URL do site"
              error={errors.site_url?.message}
              hint="Usada no botão “Ver projeto” e na captura automática de screenshot."
            >
              <Input
                {...register("site_url", { onBlur: (e) => setValue("site_url", normalizeUrl(e.target.value)) })}
                {...describedBy("site_url", errors.site_url?.message, true)}
                inputMode="url"
                placeholder="https://meusite.com.br"
              />
            </Field>
            <Field id="short_description" label="Descrição curta" error={errors.short_description?.message} hint="Aparece no card do projeto (até 300 caracteres).">
              <Textarea {...register("short_description")} {...describedBy("short_description", errors.short_description?.message, true)} rows={2} maxLength={300} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="category_id" label="Categoria">
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <NativeSelect id="category_id" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value || null)}>
                      <option value="">Sem categoria</option>
                      {projectCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                />
              </Field>
              <Field id="year" label="Ano de desenvolvimento" error={errors.year?.message}>
                <Input
                  type="number"
                  min={1990}
                  max={2100}
                  {...register("year", { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })}
                  {...describedBy("year", errors.year?.message)}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Tecnologias" description="Selecione as tecnologias usadas. Não achou? Digite o nome e crie na hora.">
            <Controller
              control={control}
              name="technology_ids"
              render={({ field }) => (
                <TechPicker
                  id="technologies"
                  technologies={technologies}
                  categories={techCategories}
                  value={field.value}
                  onChange={field.onChange}
                  onCreated={(tech) => setTechnologies((list) => [...list, tech])}
                />
              )}
            />
          </FormSection>

          <FormSection title="Imagens" description="A imagem principal aparece no card e no topo da página do projeto.">
            <Controller
              control={control}
              name="cover_path"
              render={({ field }) => (
                <ImageUpload
                  id="cover"
                  label="Imagem principal"
                  value={field.value}
                  onChange={(path) => field.onChange(path)}
                  folder="projects"
                  screenshotUrl={siteUrl ? normalizeUrl(siteUrl) : ""}
                  className="max-w-xl"
                />
              )}
            />
            <Field id="cover_alt" label="Descrição da imagem principal" hint="Texto alternativo para leitores de tela (opcional).">
              <Input {...register("cover_alt")} {...describedBy("cover_alt", undefined, true)} />
            </Field>
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-medium">Galeria (opcional)</h3>
              <p className="text-xs text-muted-foreground">Screenshots adicionais. Arraste para reordenar e marque se são de desktop ou mobile.</p>
              <GalleryManager
                value={gallery}
                onChange={(items) => {
                  setGallery(items);
                  setGalleryDirty(true);
                }}
                screenshotUrl={siteUrl ? normalizeUrl(siteUrl) : ""}
              />
            </div>
          </FormSection>

          <Accordion className="rounded-xl border bg-card">
            <AccordionItem value="case-study" className="border-none">
              <AccordionTrigger className="px-5 py-4 hover:no-underline sm:px-6">
                <span className="text-left">
                  <span className="block font-semibold">Estudo de caso técnico (opcional)</span>
                  <span className="block text-sm font-normal text-muted-foreground">
                    {caseStudyFilled
                      ? `${caseStudyFilled} de ${CASE_STUDY_FIELDS.length} campos preenchidos`
                      : "Descreva objetivo, desafios e soluções para a página de detalhes."}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 px-5 pb-6 sm:px-6">
                {CASE_STUDY_FIELDS.map((f) => (
                  <Field key={f.key} id={f.key} label={f.label} hint={f.hint} error={errors[f.key]?.message}>
                    <Textarea {...register(f.key)} {...describedBy(f.key, errors[f.key]?.message, f.hint)} rows={f.rows ?? 3} />
                  </Field>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <FormSection title="Publicação">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="featured" className="text-sm font-medium">
                  Projeto em destaque
                </label>
                <p className="text-xs text-muted-foreground">Aparece primeiro na vitrine.</p>
              </div>
              <Controller
                control={control}
                name="featured"
                render={({ field }) => <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
            <Field id="sort_order" label="Ordem de exibição" hint="Menor aparece primeiro. Também dá para arrastar na lista de projetos." error={errors.sort_order?.message}>
              <Input type="number" {...register("sort_order", { valueAsNumber: true })} {...describedBy("sort_order", errors.sort_order?.message, true)} />
            </Field>
          </FormSection>

          <FormSection title="Links">
            <Field id="repo_url" label="Repositório GitHub" hint="Opcional — deixe vazio se o código for privado." error={errors.repo_url?.message}>
              <Input
                {...register("repo_url", { onBlur: (e) => setValue("repo_url", normalizeUrl(e.target.value)) })}
                {...describedBy("repo_url", errors.repo_url?.message, true)}
                inputMode="url"
                placeholder="https://github.com/usuario/repositorio"
              />
            </Field>
            <Field
              id="slug"
              label="Endereço da página"
              error={errors.slug?.message}
              hint={<span className="font-mono">/projetos/{slugPreview}</span>}
            >
              <Input
                {...register("slug", { setValueAs: (v: string) => slugify(v ?? "") })}
                {...describedBy("slug", errors.slug?.message, true)}
                placeholder="gerado automaticamente"
              />
            </Field>
          </FormSection>
        </aside>
      </div>
    </form>
  );
}
