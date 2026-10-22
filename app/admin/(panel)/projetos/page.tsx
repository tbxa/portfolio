import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ProjectsTable } from "@/components/admin/projects-table";
import { buttonVariants } from "@/components/ui/button";
import { listProjects } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <>
      <PageHeader
        title="Projetos"
        description="Arraste pela alça para definir a ordem de exibição no portfólio."
        actions={
          <Link href="/admin/projetos/novo" className={buttonVariants()}>
            <PlusIcon data-icon="inline-start" /> Novo projeto
          </Link>
        }
      />
      <ProjectsTable projects={projects} />
    </>
  );
}
