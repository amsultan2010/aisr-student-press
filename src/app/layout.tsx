import type { Metadata, Viewport } from "next";
import { Newsreader, Libre_Franklin } from "next/font/google";
import { MotionBoot } from "@/components/site/MotionBoot";
import { SITE } from "@/lib/site";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Student news from AISR`,
    template: `%s | ${SITE.name}`,
  },
  description: `${SITE.tagline}. Campus news, student life, sports, opinion and creative work, written by students.`,
  applicationName: SITE.name,
};

export const viewport: Viewport = {
  themeColor: "#29326b",
};

// Runs before paint: enables the motion CSS (hidden [data-reveal] elements)
// only when reduced motion is off, and falls back to visible if the app does
// not hydrate. See globals.css.
const motionBoot = `(function(){var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');setTimeout(function(){if(!window.__pressMotion)d.classList.add('motion-fallback')},4000)}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${franklin.variable}`} suppressHydrationWarning>
      <body>
        <MotionBoot code={motionBoot} />
        {children}
      </body>
    </html>
  );
}
