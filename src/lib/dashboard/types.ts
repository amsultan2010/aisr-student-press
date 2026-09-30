// Shapes shared by the dashboard's client forms and its server actions.

export type ActionResult =
  | { ok: true; id?: string; published_at?: string | null }
  | { ok: false; error: string; fields?: Record<string, string> };

export type ArticleInput = {
  id: string | null;
  title: string;
  slug: string;
  dek: string;
  section_id: number;
  author_ids: string[];
  tag_ids: string[];
  cover_url: string | null;
  cover_alt: string;
  cover_caption: string;
  cover_credit: string;
  // Tiptap JSON. The editor sends it as JSON text (see ArticleEditor save()).
  body: unknown;
  status: "draft" | "published";
  published_at: string | null;
  is_lead: boolean;
  is_editors_pick: boolean;
  in_ticker: boolean;
};

export type StaffInput = {
  id: string | null;
  name: string;
  slug: string;
  role: string;
  role_group: string;
  bio: string;
  grade: string;
  instagram: string;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export const ROLE_GROUPS = [
  { value: "leadership", label: "Leadership" },
  { value: "editors", label: "Editors" },
  { value: "writers", label: "Writers" },
  { value: "photographers", label: "Photographers" },
  { value: "contributors", label: "Contributors" },
] as const;

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Riyadh has no daylight saving, so a fixed +03:00 offset is exact. Using it on
// both server and client keeps <input type="datetime-local"> values stable.
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export function isoToRiyadhInput(iso: string | null) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + RIYADH_OFFSET_MS).toISOString().slice(0, 16);
}

export function riyadhInputToIso(value: string) {
  if (!value) return null;
  const date = new Date(`${value}:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
