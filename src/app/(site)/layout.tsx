import { MotionScope } from "@/components/ui/MotionScope";
import { MOTION_SELECTOR } from "@/components/ui/motion-attrs";
import { Footer } from "@/components/site/Footer";
import { Masthead } from "@/components/site/Masthead";
import { NavBar } from "@/components/site/NavBar";
import { PointerFX } from "@/components/site/PointerFX";
import { RouteTransition } from "@/components/site/RouteTransition";
import { SiteMotion } from "@/components/site/SiteMotion";
import { Ticker } from "@/components/site/Ticker";
import { getTicker } from "@/lib/data";
import { formatDateline } from "@/lib/format";

export const revalidate = 60;

// Before hydration (motion on), hide what MotionScope will reveal, so nothing
// flashes and then jumps. The root boot script's fallback shows it all if JS fails.
const scoped = MOTION_SELECTOR.split(",")
  .map((s) => `[data-site-motion] ${s}`)
  .join(",");
const noFlash = `html.motion :is(${scoped}){visibility:hidden}html.motion-fallback :is(${scoped}){visibility:visible!important}`;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const ticker = await getTicker();
  return (
    <>
      <style>{noFlash}</style>
      <a
        href="#main"
        className="sr-only z-[200] bg-navy px-4 py-3 font-sans text-sm font-semibold text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <SiteMotion />
      <Ticker items={ticker.map((a) => ({ id: a.id, href: a.href, title: a.title, section: a.section.short_name }))} />
      <Masthead dateline={formatDateline()} />
      <NavBar />
      <MotionScope>
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
      </MotionScope>
      <PointerFX />
      <RouteTransition />
    </>
  );
}
