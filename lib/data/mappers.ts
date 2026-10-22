import type {
  Category,
  Experience,
  ProjectImage,
  ProjectWithRelations,
  Technology,
} from "@/types";

/** Ordenação padrão: sort_order e depois nome. */
export function bySortOrder<T extends { sort_order: number; name?: string }>(a: T, b: T) {
  return a.sort_order - b.sort_order || (a.name ?? "").localeCompare(b.name ?? "", "pt-BR");
}

/** Projetos em destaque primeiro e depois a ordem definida no painel. */
export function byFeaturedThenOrder(a: ProjectWithRelations, b: ProjectWithRelations) {
  return Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order;
}

export const PROJECT_SELECT = `
  *,
  category:project_categories(id, name, slug, sort_order),
  project_technologies(technology:technologies(*)),
  project_images(*)
`;

type ProjectRow = Omit<ProjectWithRelations, "category" | "technologies" | "images"> & {
  category: Category | null;
  project_technologies: { technology: Technology | null }[] | null;
  project_images: ProjectImage[] | null;
};

export function mapProject(row: ProjectRow): ProjectWithRelations {
  const { project_technologies, project_images, ...rest } = row;
  return {
    ...rest,
    technologies: (project_technologies ?? [])
      .map((pt) => pt.technology)
      .filter((t): t is Technology => Boolean(t))
      .sort(bySortOrder),
    images: [...(project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export const EXPERIENCE_SELECT = `*, experience_technologies(technology:technologies(*))`;

type ExperienceRow = Omit<Experience, "technologies"> & {
  experience_technologies: { technology: Technology | null }[] | null;
};

export function mapExperience(row: ExperienceRow): Experience {
  const { experience_technologies, ...rest } = row;
  return {
    ...rest,
    technologies: (experience_technologies ?? [])
      .map((et) => et.technology)
      .filter((t): t is Technology => Boolean(t))
      .sort(bySortOrder),
  };
}
