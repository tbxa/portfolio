import "server-only";

import { cache } from "react";

import {
  byFeaturedThenOrder,
  bySortOrder,
  EXPERIENCE_SELECT,
  mapExperience,
  mapProject,
  PROJECT_SELECT,
} from "@/lib/data/mappers";
import { DEFAULT_SETTINGS, EMPTY_PROFILE } from "@/lib/defaults";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Category,
  Certification,
  Education,
  Experience,
  Profile,
  ProjectWithRelations,
  SiteSettings,
  SkillGroup,
  Technology,
} from "@/types";

/**
 * Leituras do site público. Falhas viram valores vazios (e um log no
 * servidor) para que um problema no banco nunca derrube a página inteira.
 */
async function safely<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error(`[data] ${label}:`, error);
    return fallback;
  }
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

export const getProfile = cache(
  (): Promise<Profile> =>
    safely("profile", EMPTY_PROFILE, async () => {
      const row = unwrap(await createPublicClient().from("profile").select("*").maybeSingle());
      return { ...EMPTY_PROFILE, ...(row ?? {}) };
    })
);

export const getSettings = cache(
  (): Promise<SiteSettings> =>
    safely("settings", DEFAULT_SETTINGS, async () => {
      const row = unwrap(await createPublicClient().from("site_settings").select("*").maybeSingle());
      return { ...DEFAULT_SETTINGS, ...(row ?? {}) };
    })
);

export const getPublishedProjects = cache(
  (): Promise<ProjectWithRelations[]> =>
    safely("projects", [], async () => {
      const rows = unwrap(
        await createPublicClient().from("projects").select(PROJECT_SELECT).eq("status", "published")
      );
      return (rows ?? []).map(mapProject).sort(byFeaturedThenOrder);
    })
);

export const getProjectBySlug = cache(
  (slug: string): Promise<ProjectWithRelations | null> =>
    safely("project", null, async () => {
      const row = unwrap(
        await createPublicClient()
          .from("projects")
          .select(PROJECT_SELECT)
          .eq("status", "published")
          .eq("slug", slug)
          .maybeSingle()
      );
      return row ? mapProject(row) : null;
    })
);

export const getProjectCategories = cache(
  (): Promise<Category[]> =>
    safely("project_categories", [], async () =>
      unwrap(await createPublicClient().from("project_categories").select("*")).sort(bySortOrder)
    )
);

export const getTechCategories = cache(
  (): Promise<Category[]> =>
    safely("tech_categories", [], async () =>
      unwrap(await createPublicClient().from("tech_categories").select("*")).sort(bySortOrder)
    )
);

/** Tecnologias visíveis agrupadas por categoria (categorias vazias ficam de fora). */
export const getSkillGroups = cache(
  (): Promise<SkillGroup[]> =>
    safely("skills", [], async () => {
      const [categories, technologies] = await Promise.all([
        getTechCategories(),
        createPublicClient()
          .from("technologies")
          .select("*")
          .eq("visible", true)
          .then((r) => unwrap<Technology[]>(r)),
      ]);
      const groups: SkillGroup[] = categories.map((category) => ({
        category,
        technologies: technologies.filter((t) => t.category_id === category.id).sort(bySortOrder),
      }));
      const known = new Set(categories.map((c) => c.id));
      const others = technologies.filter((t) => !t.category_id || !known.has(t.category_id));
      if (others.length) groups.push({ category: null, technologies: others.sort(bySortOrder) });
      return groups.filter((g) => g.technologies.length > 0);
    })
);

export const getExperiences = cache(
  (): Promise<Experience[]> =>
    safely("experiences", [], async () => {
      const rows = unwrap(
        await createPublicClient().from("experiences").select(EXPERIENCE_SELECT).eq("visible", true)
      );
      return (rows ?? []).map(mapExperience).sort((a, b) => a.sort_order - b.sort_order);
    })
);

export const getEducation = cache(
  (): Promise<Education[]> =>
    safely("education", [], async () =>
      unwrap<Education[]>(
        await createPublicClient().from("education").select("*").eq("visible", true)
      ).sort((a, b) => a.sort_order - b.sort_order)
    )
);

export const getCertifications = cache(
  (): Promise<Certification[]> =>
    safely("certifications", [], async () =>
      unwrap<Certification[]>(
        await createPublicClient().from("certifications").select("*").eq("visible", true)
      ).sort((a, b) => a.sort_order - b.sort_order)
    )
);
