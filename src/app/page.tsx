import Link from "next/link";
import { getLatest } from "@/lib/data";

export const revalidate = 60;

// Temporary smoke-test page. The homepage builder replaces this file.
export default async function Home() {
  const latest = await getLatest(20);
  return (
    <main className="mx-auto max-w-3xl p-10">
      <h1 className="font-serif text-5xl">The AISR Student Press</h1>
      <ul className="mt-8 space-y-3 font-sans">
        {latest.map((a) => (
          <li key={a.id}>
            <Link href={a.href}>{a.title}</Link>
            <span className="text-ink-soft"> · {a.section.short_name} · {a.authors.map((x) => x.name).join(", ")}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
