import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <PageHeader title="Configurações" description="SEO, compartilhamento e privacidade." />
      <SettingsForm settings={settings} />
    </>
  );
}
