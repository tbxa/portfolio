import type { Metadata } from "next";

import { CategoriesManager } from "@/components/admin/categories-manager";
import { PageHeader } from "@/components/admin/page-header";
import { TechnologiesManager } from "@/components/admin/technologies-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listCategories, listTechnologies, technologyUsage } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Tecnologias" };

export default async function TechnologiesPage() {
  const [technologies, techCategories, projectCategories, usage] = await Promise.all([
    listTechnologies(),
    listCategories("tech_categories"),
    listCategories("project_categories"),
    technologyUsage(),
  ]);

  return (
    <>
      <PageHeader title="Tecnologias e categorias" description="Gerencie as tecnologias exibidas no portfólio e as categorias usadas nos filtros." />
      <Tabs defaultValue="technologies">
        <TabsList className="mb-4">
          <TabsTrigger value="technologies">Tecnologias</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>
        <TabsContent value="technologies">
          <TechnologiesManager technologies={technologies} categories={techCategories} usage={usage} />
        </TabsContent>
        <TabsContent value="categories" className="grid gap-6 lg:grid-cols-2">
          <CategoriesManager
            table="tech_categories"
            categories={techCategories}
            title="Categorias de tecnologia"
            description="Agrupam as tecnologias (Frontend, Backend, Banco de dados…)."
            deleteWarning="As tecnologias desta categoria ficarão sem categoria."
          />
          <CategoriesManager
            table="project_categories"
            categories={projectCategories}
            title="Categorias de projeto"
            description="Usadas nos filtros da vitrine de projetos."
            deleteWarning="Os projetos desta categoria ficarão sem categoria."
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
