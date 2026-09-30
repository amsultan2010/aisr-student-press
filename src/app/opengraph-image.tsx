import { ImageResponse } from "next/og";
import { SECTIONS, SITE } from "@/lib/site";
import { DoubleRule, OG, OG_SIZE, ogFonts, sans, sealDataUri, serif } from "@/components/pages/og-card";

export const alt = `${SITE.name}, the student newspaper of the American International School of Riyadh`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const kicker = "American International School of Riyadh";
  const tagline = "Student news, sport, opinion and creative work";
  const sections = SECTIONS.map((s) => s.name).join("   ");
  const [fonts, seal] = await Promise.all([
    ogFonts(`${SITE.name}${tagline}`, `${kicker}${sections}Riyadh, Saudi Arabia`.toUpperCase()),
    sealDataUri(),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: OG.paper, color: OG.ink }}>
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 72px 0", flexGrow: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: OG.inkSoft, ...sans }}>
            <span>{kicker}</span>
            <span>Riyadh, Saudi Arabia</span>
          </div>
          <div style={{ display: "flex", marginTop: 20 }}>
            <DoubleRule />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 44 }}>
            <img src={seal} width={150} height={150} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 112, lineHeight: 0.95, letterSpacing: "-0.03em", ...serif }}>
                The AISR
              </div>
              <div style={{ display: "flex", fontSize: 112, lineHeight: 0.95, letterSpacing: "-0.03em", ...serif }}>
                Student Press
              </div>
            </div>
          </div>
          <div style={{ display: "flex", width: 120, height: 4, background: OG.gold, marginTop: 40 }} />
          <div style={{ display: "flex", fontSize: 34, marginTop: 20, color: OG.inkSoft, ...serif }}>{tagline}</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: OG.navy,
            color: OG.paper,
            padding: "26px 72px",
            fontSize: 19,
            ...sans,
          }}
        >
          {SECTIONS.map((s) => (
            <span key={s.slug}>{s.name}</span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
