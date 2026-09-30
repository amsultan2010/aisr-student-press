# The AISR Student Press

Website of The AISR Student Press, the student newspaper club at the American International School
of Riyadh. Public newspaper site plus a private dashboard where the editors write and manage
articles.

Built with Next.js 16, Supabase (database, Google sign-in, image storage) and GSAP.

## Run it locally

```bash
pnpm install
cp .env.example .env.local   # fill in the three values
pnpm dev                     # http://localhost:3000
```

`.env.local` needs:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (Project Settings, API Keys) |
| `NEXT_PUBLIC_SITE_URL` | The public URL of the site, e.g. `https://press.example.com` (used for canonical links, sitemap and share images) |

## What is where

| Path | What it is |
| --- | --- |
| `/` | Homepage: top story, latest stories, section highlights, Article of the Month, about the club |
| `/news`, `/student-life`, `/sports`, `/opinion`, `/creative-corner` | Section fronts |
| `/[section]/[slug]` | Articles |
| `/author/[slug]`, `/tag/[slug]`, `/search` | Author pages, tag pages, search |
| `/about` | Mission, team directory and editorial ethics policy |
| `/submit` | Pitch and contact form for students outside the staff |
| `/login`, `/dashboard` | Editors' sign-in and dashboard |
| `supabase/migrations/` | Database schema, security rules and storage buckets |

## Giving the editors access

Only email addresses on the admin allowlist can use the dashboard. Everyone else who signs in sees
"You do not have access".

1. **Turn on Google sign-in** (one time):
   - In Google Cloud Console, create an OAuth client ID of type "Web application".
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
   - In Supabase: Authentication, Sign In / Providers, Google: paste the client ID and secret, enable it.
   - In Supabase: Authentication, URL Configuration: set Site URL to the live site URL, and add
     `https://<your-domain>/auth/callback` and `http://localhost:3000/auth/callback` to Redirect URLs.
2. **Add each editor's Gmail address** in the Supabase SQL editor (lowercase):

   ```sql
   insert into public.admins (email) values ('first.editor@gmail.com'), ('second.editor@gmail.com');
   ```

   Remove someone with `delete from public.admins where email = '...';`

## Placeholder content

The site ships with obvious placeholder articles and staff profiles so the layout can be judged
before real stories exist. In the dashboard, Articles, "Delete all placeholder content" removes all
of them at once. The two Co-Editors-in-Chief are real entries; add their photos under Team.

## Credits

Built by [Abdullah Sultan](https://amsultan.site). Placeholder photos from Lorem Picsum (Unsplash
photographers).
