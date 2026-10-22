import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { TimelineManager } from "@/components/admin/timeline-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listCategories, listCertifications, listEducation, listExperiences, listTechnologies } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Experiência e formação" };

export default async function TimelinePage() {
  const [experiences, education, certifications, technologies, categories] = await Promise.all([
    listExperiences(),
    listEducation(),
    listCertifications(),
    listTechnologies(),
    listCategories("tech_categories"),
  ]);

  return (
    <>
      <PageHeader title="Experiência e formação" description="Timeline profissional, formação acadêmica e certificações. Arraste para ordenar." />
      <Tabs defaultValue="experiences">
        <TabsList className="mb-4">
          <TabsTrigger value="experiences">Experiência ({experiences.length})</TabsTrigger>
          <TabsTrigger value="education">Formação ({education.length})</TabsTrigger>
          <TabsTrigger value="certifications">Certificações ({certifications.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="experiences">
          <TimelineManager table="experiences" items={experiences} technologies={technologies} categories={categories} />
        </TabsContent>
        <TabsContent value="education">
          <TimelineManager table="education" items={education} />
        </TabsContent>
        <TabsContent value="certifications">
          <TimelineManager table="certifications" items={certifications} />
        </TabsContent>
      </Tabs>
    </>
  );
}
