import { AdminShell } from "@/components/admin/admin-shell";
import { AccessNotice } from "@/components/admin/access-notice";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// As Server Actions de captura de screenshot podem levar alguns segundos.
export const maxDuration = 60;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (session.status === "unconfigured") return <AccessNotice kind="unconfigured" />;
  if (session.status === "anonymous") redirect("/admin/login");
  if (session.status === "forbidden") return <AccessNotice kind="forbidden" email={session.user.email ?? ""} />;

  return <AdminShell email={session.user.email ?? ""}>{children}</AdminShell>;
}
