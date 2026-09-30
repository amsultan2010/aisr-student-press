import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared pieces for the generated Open Graph images (next/og, Satori).
// Satori needs explicit flex layout and TTF/OTF fonts, so fonts are pulled
// from the Google Fonts CSS API as static instances. If that fails the image
// still renders with the built-in fallback font.

export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  paper: "#f7f3ea",
  paper2: "#eee7d7",
  ink: "#141a33",
  inkSoft: "#545a70",
  rule: "#d5cbb4",
  navy: "#29326b",
  navyDeep: "#161c42",
  gold: "#bb932b",
  goldSoft: "#dcc38a",
};

async function googleFont(family: string, axes: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:${axes}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!src) throw new Error(`No font file for ${family}`);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Font download failed for ${family}`);
  return res.arrayBuffer();
}

export async function ogFonts(serifText: string, sansText: string) {
  try {
    const [serif, sans] = await Promise.all([
      googleFont("Newsreader", "opsz,wght@72,600", serifText),
      googleFont("Libre+Franklin", "wght@600", sansText),
    ]);
    return [
      { name: "Newsreader", data: serif, weight: 600 as const, style: "normal" as const },
      { name: "Franklin", data: sans, weight: 600 as const, style: "normal" as const },
    ];
  } catch {
    return undefined;
  }
}

export async function sealDataUri() {
  const png = await readFile(join(process.cwd(), "public", "aisr-seal.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

export const serif = { fontFamily: "Newsreader, serif" };
export const sans = { fontFamily: "Franklin, sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" as const };

// Two hairlines, the masthead's double rule.
export function DoubleRule({ color = OG.ink }: { color?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ height: 3, background: color, width: "100%" }} />
      <div style={{ height: 4 }} />
      <div style={{ height: 1, background: color, width: "100%" }} />
    </div>
  );
}
