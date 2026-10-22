import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { ResumeManager } from "@/components/admin/resume-manager";
import { getAdminProfile } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Currículo" };

export default async function ResumePage() {
  const profile = await getAdminProfile();
  return (
    <>
      <PageHeader title="Currículo" description="O PDF aberto pelo botão “Visualizar currículo”." />
      <ResumeManager path={profile.resume_path} updatedAt={profile.resume_updated_at} />
    </>
  );
}
