import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ProjectForm } from "@/components/admin/project-form";
import { getProject, listCategories, listTechnologies } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Editar projeto" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const [project, technologies, techCategories, projectCategories] = await Promise.all([
    getProject(id),
    listTechnologies(),
    listCategories("tech_categories"),
    listCategories("project_categories"),
  ]);
  if (!project) notFound();

  return (
    <ProjectForm
      key={project.updated_at}
      project={project}
      technologies={technologies}
      techCategories={techCategories}
      projectCategories={projectCategories}
      defaultSortOrder={project.sort_order}
    />
  );
}
