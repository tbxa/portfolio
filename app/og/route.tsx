import { ImageResponse } from "next/og";

import { getProfile, getSettings } from "@/lib/data/public";

/** Imagem de compartilhamento padrão (usada quando nenhuma foi enviada no painel). */
export async function GET() {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  const name = profile.full_name || settings.site_title;
  const role = profile.role_title || "Desenvolvedor de Software";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#16171c",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#f3f4f6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#5fd4a8", fontFamily: "monospace" }}>~/portfolio</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{name}</div>
          <div style={{ marginTop: 20, fontSize: 36, color: "#a1a5b0" }}>{role}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#a1a5b0" }}>Projetos · Tecnologias · Experiência</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
