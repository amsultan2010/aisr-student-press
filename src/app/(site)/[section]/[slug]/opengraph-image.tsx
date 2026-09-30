import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getArticle } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { SITE, isSectionSlug } from "@/lib/site";
import { DoubleRule, OG, OG_SIZE, ogFonts, sans, sealDataUri, serif } from "@/components/pages/og-card";

export const revalidate = 60;
export const alt = `Story from ${SITE.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

// Local placeholder paths are read from /public, Storage URLs are fetched.
async function coverDataUri(src: string | null) {
  if (!src) return null;
  try {
    if (src.startsWith("/")) {
      const buf = await readFile(join(process.cwd(), "public", src));
      const type = src.endsWith(".png") ? "image/png" : "image/jpeg";
      return `data:${type};base64,${buf.toString("base64")}`;
    }
    const res = await fetch(src);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

function headlineSize(title: string, hasCover: boolean) {
  const n = title.length * (hasCover ? 1.45 : 1);
  if (n <= 60) return 76;
  if (n <= 95) return 64;
  if (n <= 130) return 54;
  return 46;
}

export default async function Image({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const article = isSectionSlug(section) ? await getArticle(section, slug) : null;
  const title = article?.title ?? SITE.name;
  const kicker = article?.section.name ?? "Student newspaper";
  const names = article?.authors.map((a) => a.name).join(" and ");
  const byline = names ? `By ${names}` : SITE.school;
  const date = article ? formatDate(article.published_at) : "";

  const [fonts, seal, cover] = await Promise.all([
    ogFonts(`${title}${SITE.name}`, `${kicker}${byline}${date}`.toUpperCase()),
    sealDataUri(),
    coverDataUri(article?.cover_url ?? null),
  ]);
  const textWidth = cover ? 700 : 1200;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: OG.paper, color: OG.ink }}>
        <div style={{ display: "flex", flexDirection: "column", width: textWidth, padding: "48px 56px 44px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={seal} width={56} height={56} alt="" />
            <div style={{ display: "flex", fontSize: 34, letterSpacing: "-0.02em", ...serif }}>{SITE.name}</div>
          </div>
          <div style={{ display: "flex", marginTop: 20 }}>
            <DoubleRule />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: 22, color: OG.gold, ...sans }}>{kicker}</div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: headlineSize(title, Boolean(cover)),
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
                ...serif,
              }}
            >
              {title}
            </div>
          </div>
          <div style={{ display: "flex", width: 96, height: 4, background: OG.gold, marginBottom: 18 }} />
          <div style={{ display: "flex", fontSize: 18, color: OG.ink, ...sans }}>{byline}</div>
          {date ? <div style={{ display: "flex", fontSize: 16, marginTop: 8, color: OG.inkSoft, ...sans }}>{date}</div> : null}
        </div>
        {cover ? (
          <div style={{ display: "flex", width: 500, height: "100%", borderLeft: `8px solid ${OG.navy}` }}>
            <img src={cover} width={492} height={630} alt="" style={{ objectFit: "cover", width: 492, height: 630 }} />
          </div>
        ) : null}
      </div>
    ),
    { ...size, fonts },
  );
}
