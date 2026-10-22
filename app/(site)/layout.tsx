import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getProfile } from "@/lib/data/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <>
      <SiteHeader name={profile.full_name} githubUrl={profile.github_url} linkedinUrl={profile.linkedin_url} />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter name={profile.full_name} />
    </>
  );
}
