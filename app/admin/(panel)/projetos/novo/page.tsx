import type { Metadata } from "next";

import { ProjectForm } from "@/components/admin/project-form";
import { listCategories, listTechnologies, nextTopSortOrder } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Novo projeto" };

export default async function NewProjectPage() {
  const [technologies, techCategories, projectCategories, sortOrder] = await Promise.all([
    listTechnologies(),
    listCategories("tech_categories"),
    listCategories("project_categories"),
    nextTopSortOrder(),
  ]);
  return (
    <ProjectForm
      project={null}
      technologies={technologies}
      techCategories={techCategories}
      projectCategories={projectCategories}
      defaultSortOrder={sortOrder}
    />
  );
}
