import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getProfile, getSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env";
import { storageUrl } from "@/lib/storage";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  const title = profile.full_name
    ? `${profile.full_name}${profile.role_title ? ` — ${profile.role_title}` : ""}`
    : settings.site_title;
  const ogImage = storageUrl(settings.og_image_path);

  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: title, template: `%s · ${profile.full_name || settings.site_title}` },
    description: settings.site_description || profile.summary || undefined,
    keywords: settings.keywords.length ? settings.keywords : undefined,
    authors: profile.full_name ? [{ name: profile.full_name, url: publicEnv.siteUrl }] : undefined,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: profile.full_name || settings.site_title,
      title,
      description: settings.site_description || profile.summary || undefined,
      images: [{ url: ogImage ?? "/og", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#16171c" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster richColors closeButton position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
