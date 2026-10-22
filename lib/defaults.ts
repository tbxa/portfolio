import type { Profile, SiteSettings } from "@/types";

/** Valores usados quando o banco ainda não está configurado ou está vazio. */
export const EMPTY_PROFILE: Profile = {
  full_name: "",
  role_title: "",
  hero_title: "",
  hero_subtitle: "",
  bio: "",
  summary: "",
  experience_summary: "",
  interests: [],
  goals: "",
  avatar_path: null,
  location: "",
  email: "",
  whatsapp: "",
  github_url: "",
  linkedin_url: "",
  resume_path: null,
  resume_updated_at: null,
  updated_at: new Date(0).toISOString(),
};

export const DEFAULT_SETTINGS: SiteSettings = {
  site_title: "Portfólio",
  site_description: "Portfólio de desenvolvimento de software.",
  keywords: [],
  og_image_path: null,
  show_location: true,
  show_whatsapp: false,
};
