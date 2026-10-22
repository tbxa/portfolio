import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { ProfileForm } from "@/components/admin/profile-form";
import { getAdminProfile } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const profile = await getAdminProfile();
  return (
    <>
      <PageHeader title="Perfil" description="Suas informações pessoais e profissionais. Preencha apenas o que for verdadeiro e relevante." />
      <ProfileForm key={profile.updated_at} profile={profile} />
    </>
  );
}
