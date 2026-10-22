import type { MetadataRoute } from "next";

import { getProfile, getPublishedProjects } from "@/lib/data/public";
import { publicEnv } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, profile] = await Promise.all([getPublishedProjects(), getProfile()]);
  const latest = [profile.updated_at, ...projects.map((p) => p.updated_at)].sort().at(-1);

  return [
    {
      url: publicEnv.siteUrl,
      lastModified: latest ? new Date(latest) : undefined,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((p) => ({
      url: `${publicEnv.siteUrl}/projetos/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: p.featured ? 0.9 : 0.7,
    })),
  ];
}
