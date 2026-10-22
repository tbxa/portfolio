export type ProjectStatus = "draft" | "published";
export type ImageKind = "desktop" | "mobile" | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category_id: string | null;
  sort_order: number;
  visible: boolean;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  path: string;
  alt: string;
  kind: ImageKind;
  sort_order: number;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  category_id: string | null;
  year: number | null;
  site_url: string;
  repo_url: string;
  cover_path: string | null;
  cover_alt: string;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
  published_at: string | null;
  description: string;
  goal: string;
  problem: string;
  features: string;
  role: string;
  challenges: string;
  solutions: string;
  architecture: string;
  integrations: string;
  created_at: string;
  updated_at: string;
}

/** Projeto com relações já resolvidas, pronto para renderizar. */
export interface ProjectWithRelations extends Project {
  category: Category | null;
  technologies: Technology[];
  images: ProjectImage[];
}

export interface Profile {
  full_name: string;
  role_title: string;
  hero_title: string;
  hero_subtitle: string;
  bio: string;
  summary: string;
  experience_summary: string;
  interests: string[];
  goals: string;
  avatar_path: string | null;
  location: string;
  email: string;
  whatsapp: string;
  github_url: string;
  linkedin_url: string;
  resume_path: string | null;
  resume_updated_at: string | null;
  updated_at: string;
}

export interface SiteSettings {
  site_title: string;
  site_description: string;
  keywords: string[];
  og_image_path: string | null;
  show_location: boolean;
  show_whatsapp: boolean;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  employment_type: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  responsibilities: string;
  sort_order: number;
  visible: boolean;
  technologies: Technology[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string;
  sort_order: number;
  visible: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issued_at: string | null;
  credential_id: string;
  credential_url: string;
  sort_order: number;
  visible: boolean;
}

export interface SkillGroup {
  category: Category | null;
  technologies: Technology[];
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Campos necessários para o card — evita enviar o estudo de caso inteiro ao navegador. */
export type ProjectCardData = Pick<
  ProjectWithRelations,
  | "id"
  | "slug"
  | "name"
  | "short_description"
  | "category"
  | "year"
  | "site_url"
  | "repo_url"
  | "cover_path"
  | "featured"
  | "technologies"
>;
