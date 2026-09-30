import { cx } from "./cx";

// The club mark: a Newsreader "SP" monogram over a gold rule. Glyph outlines
// are baked in so it renders identically everywhere (favicon: src/app/icon.svg).
const S = "M26.65 14.48 23.82 14 26.39 11.85H26.77L28.29 21.82L27.68 21.94L23.31 14.99L24.99 17.02Q23.39 15.46 21.75 14.73Q20.11 14 18.37 14Q15.83 14 14.71 15.16Q13.59 16.32 13.59 18.17Q13.59 19.48 14.2 20.36Q14.8 21.24 15.86 21.85Q16.91 22.45 18.27 22.93Q19.62 23.41 21.1 23.91Q22.59 24.42 24.06 25.09Q25.52 25.75 26.73 26.77Q27.94 27.78 28.68 29.33Q29.42 30.88 29.42 33.15Q29.42 36.14 27.8 38.37Q26.18 40.59 23.47 41.8Q20.77 43.01 17.49 43.01Q15.29 43.01 13.51 42.74Q11.73 42.46 9.8 41.74L8.12 33.48H8.78L14.41 42.05L10.79 39.67Q12.63 40.68 14.11 41.23Q15.58 41.78 17.2 41.78Q19.68 41.78 21.3 41.06Q22.92 40.35 23.71 39.06Q24.5 37.76 24.5 36.04Q24.5 34.36 23.76 33.27Q23.02 32.19 21.81 31.47Q20.6 30.75 19.14 30.22Q17.67 29.69 16.22 29.15Q14.76 28.62 13.45 27.99Q12.14 27.35 11.11 26.46Q10.09 25.57 9.5 24.28Q8.92 22.98 8.92 21.16Q8.92 18.56 10.21 16.65Q11.5 14.74 13.88 13.71Q16.26 12.67 19.46 12.67Q21.51 12.67 23.18 13.1Q24.85 13.53 26.65 14.48Z";
const P = "M49.16 21.43Q49.16 19.29 48.34 17.81Q47.52 16.32 45.66 15.54Q43.81 14.76 40.73 14.76H36.02L36.22 13.18H44.99Q48.89 13.18 51.28 14.27Q53.67 15.36 54.77 17.18Q55.88 19.01 55.88 21.26Q55.88 23.54 54.74 25.45Q53.6 27.37 51.2 28.51Q48.79 29.65 44.99 29.65H36.22L36.02 28.07H42.41Q44.38 28.07 45.91 27.31Q47.43 26.55 48.3 25.08Q49.16 23.6 49.16 21.43ZM39.83 13.18V40.92L43.19 41.82V42.5H29.62V41.82L32.98 40.92V14.74L29.62 13.86V13.18Z";

type MarkProps = {
  /** "tile" = paper letters on a navy square, "plain" = letters only. */
  variant?: "tile" | "plain";
  /** Letter colour for the plain variant. */
  tone?: "navy" | "paper";
  className?: string;
  title?: string;
};

export function Mark({ variant = "plain", tone = "navy", className, title }: MarkProps) {
  const letters = variant === "tile" || tone === "paper" ? "var(--color-paper)" : "var(--color-navy)";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cx("block aspect-square", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {variant === "tile" && <rect width="64" height="64" fill="var(--color-navy)" />}
      <path fill={letters} d={S} />
      <path fill={letters} d={P} />
      <rect data-mark-rule x="8" y="48" width="48" height="2.5" fill="var(--color-gold)" />
    </svg>
  );
}
