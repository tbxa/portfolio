import "server-only";

import { requireAdminPage } from "@/lib/auth";
import { bySortOrder, EXPERIENCE_SELECT, mapExperience, mapProject, PROJECT_SELECT } from "@/lib/data/mappers";
import { DEFAULT_SETTINGS, EMPTY_PROFILE } from "@/lib/defaults";
import type {
  Category,
  Certification,
  Education,
  Experience,
  Profile,
  ProjectWithRelations,
  SiteSettings,
  Technology,
} from "@/types";

/** Leituras do painel: sem cache, com a sessão do administrador (vê rascunhos). */
async function client() {
  return (await requireAdminPage()).supabase;
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export async function listProjects(): Promise<ProjectWithRelations[]> {
  const supabase = await client();
  const rows = unwrap(await supabase.from("projects").select(PROJECT_SELECT).order("sort_order"));
  return (rows ?? []).map(mapProject);
}

export async function getProject(id: string): Promise<ProjectWithRelations | null> {
  const supabase = await client();
  const row = unwrap(await supabase.from("projects").select(PROJECT_SELECT).eq("id", id).maybeSingle());
  return row ? mapProject(row) : null;
}

/** Novos projetos entram no topo da vitrine. */
export async function nextTopSortOrder() {
  const supabase = await client();
  const { data } = await supabase.from("projects").select("sort_order").order("sort_order").limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? 1) - 1;
}

export async function listTechnologies(): Promise<Technology[]> {
  const supabase = await client();
  return unwrap<Technology[]>(await supabase.from("technologies").select("*")).sort(bySortOrder);
}

/** Quantos projetos usam cada tecnologia (para avisar antes de excluir). */
export async function technologyUsage(): Promise<Record<string, number>> {
  const supabase = await client();
  const rows = unwrap<{ technology_id: string }[]>(
    await supabase.from("project_technologies").select("technology_id")
  );
  const usage: Record<string, number> = {};
  for (const row of rows) usage[row.technology_id] = (usage[row.technology_id] ?? 0) + 1;
  return usage;
}

export async function listCategories(table: "tech_categories" | "project_categories"): Promise<Category[]> {
  const supabase = await client();
  return unwrap<Category[]>(await supabase.from(table).select("*")).sort(bySortOrder);
}

export async function getAdminProfile(): Promise<Profile> {
  const supabase = await client();
  const row = unwrap(await supabase.from("profile").select("*").maybeSingle());
  return { ...EMPTY_PROFILE, ...(row ?? {}) };
}

export async function getAdminSettings(): Promise<SiteSettings> {
  const supabase = await client();
  const row = unwrap(await supabase.from("site_settings").select("*").maybeSingle());
  return { ...DEFAULT_SETTINGS, ...(row ?? {}) };
}

export async function listExperiences(): Promise<Experience[]> {
  const supabase = await client();
  const rows = unwrap(await supabase.from("experiences").select(EXPERIENCE_SELECT).order("sort_order"));
  return (rows ?? []).map(mapExperience);
}

export async function listEducation(): Promise<Education[]> {
  const supabase = await client();
  return unwrap<Education[]>(await supabase.from("education").select("*").order("sort_order"));
}

export async function listCertifications(): Promise<Certification[]> {
  const supabase = await client();
  return unwrap<Certification[]>(await supabase.from("certifications").select("*").order("sort_order"));
}
