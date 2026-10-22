import { z } from "zod";

/** Aceita "meusite.com" e completa com https://. */
export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** URL http(s) opcional — string vazia é permitida. */
const optionalUrl = z
  .string()
  .max(2048)
  .transform(normalizeUrl)
  .refine((v) => v === "" || isHttpUrl(v), "Informe uma URL válida (https://…).");

const text = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`);
const slug = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.");
const optionalSlug = z.union([z.literal(""), slug]);
const storagePath = z
  .string()
  .max(512)
  .regex(/^[a-zA-Z0-9/_.-]+$/, "Caminho de arquivo inválido.")
  .refine((v) => !v.includes(".."), "Caminho de arquivo inválido.");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");
const optionalDate = z.union([z.literal(""), isoDate]).nullable().transform((v) => v || null);

export const projectImageSchema = z.object({
  id: z.uuid().optional(),
  path: storagePath,
  alt: text(200).default(""),
  kind: z.enum(["desktop", "mobile", "other"]),
});

export const projectSchema = z.object({
  name: text(120).min(1, "Informe o nome do projeto."),
  slug: optionalSlug.default(""),
  site_url: optionalUrl,
  repo_url: optionalUrl,
  short_description: text(300).default(""),
  category_id: z.uuid().nullable(),
  year: z.number().int().min(1990).max(2100).nullable(),
  cover_path: storagePath.nullable(),
  cover_alt: text(200).default(""),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  sort_order: z.number().int().min(-100000).max(100000),
  description: text(10000).default(""),
  goal: text(4000).default(""),
  problem: text(4000).default(""),
  features: text(6000).default(""),
  role: text(4000).default(""),
  challenges: text(6000).default(""),
  solutions: text(6000).default(""),
  architecture: text(6000).default(""),
  integrations: text(2000).default(""),
  technology_ids: z.array(z.uuid()).max(60),
  images: z.array(projectImageSchema).max(40),
});
export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectValues = z.output<typeof projectSchema>;

export const technologySchema = z.object({
  name: text(60).min(1, "Informe o nome."),
  slug: optionalSlug.default(""),
  icon: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => v === "" || /^[a-z0-9]+$/.test(v) || /^https:\/\/\S+$/.test(v),
      "Use um slug do Simple Icons (ex.: react) ou uma URL https."
    ),
  category_id: z.uuid().nullable(),
  visible: z.boolean(),
});
export type TechnologyValues = z.output<typeof technologySchema>;

export const categorySchema = z.object({
  name: text(60).min(1, "Informe o nome."),
  slug: optionalSlug.default(""),
});
export type CategoryValues = z.output<typeof categorySchema>;

export const profileSchema = z.object({
  full_name: text(120),
  role_title: text(120),
  hero_title: text(200),
  hero_subtitle: text(400),
  bio: text(6000),
  summary: text(2000),
  experience_summary: text(3000),
  interests: z.array(text(60).min(1)).max(30),
  goals: text(2000),
  avatar_path: storagePath.nullable(),
  location: text(120),
  email: z.union([z.literal(""), z.email("E-mail inválido.").max(200)]),
  whatsapp: text(30).regex(/^[\d\s()+-]*$/, "Use apenas números, espaços, parênteses e +."),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
});
export type ProfileValues = z.output<typeof profileSchema>;

export const settingsSchema = z.object({
  site_title: text(80).min(1, "Informe o título do site."),
  site_description: text(300),
  keywords: z.array(text(40).min(1)).max(30),
  og_image_path: storagePath.nullable(),
  show_location: z.boolean(),
  show_whatsapp: z.boolean(),
});
export type SettingsValues = z.output<typeof settingsSchema>;

export const experienceSchema = z
  .object({
    company: text(120).min(1, "Informe a empresa."),
    role: text(120).min(1, "Informe o cargo."),
    location: text(120).default(""),
    employment_type: text(60).default(""),
    start_date: isoDate,
    end_date: optionalDate,
    is_current: z.boolean(),
    description: text(4000).default(""),
    responsibilities: text(4000).default(""),
    visible: z.boolean(),
    technology_ids: z.array(z.uuid()).max(60),
  })
  .refine((v) => v.is_current || !v.end_date || v.end_date >= v.start_date, {
    path: ["end_date"],
    message: "A data final deve ser posterior à inicial.",
  });
export type ExperienceValues = z.output<typeof experienceSchema>;

export const educationSchema = z.object({
  institution: text(160).min(1, "Informe a instituição."),
  degree: text(160).min(1, "Informe o curso ou grau."),
  field: text(160).default(""),
  start_date: optionalDate,
  end_date: optionalDate,
  is_current: z.boolean(),
  description: text(2000).default(""),
  visible: z.boolean(),
});
export type EducationValues = z.output<typeof educationSchema>;

export const certificationSchema = z.object({
  name: text(160).min(1, "Informe o nome."),
  issuer: text(160).default(""),
  issued_at: optionalDate,
  credential_id: text(120).default(""),
  credential_url: optionalUrl,
  visible: z.boolean(),
});
export type CertificationValues = z.output<typeof certificationSchema>;

export const reorderSchema = z.object({
  table: z.enum([
    "projects",
    "technologies",
    "tech_categories",
    "project_categories",
    "experiences",
    "education",
    "certifications",
  ]),
  ids: z.array(z.uuid()).max(500),
});

export const screenshotSchema = z.object({
  url: optionalUrl.refine((v) => v !== "", "Informe a URL do site."),
  device: z.enum(["desktop", "mobile"]),
});

/** Converte erros do Zod em { campo: [mensagens] } para exibir no formulário. */
export function fieldErrorsOf(error: z.ZodError) {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
