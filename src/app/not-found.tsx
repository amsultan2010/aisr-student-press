import SiteLayout from "./(site)/layout";
import { NotFoundView } from "@/components/pages/NotFoundView";

// URLs that match no route at all. Wrapped in the site layout so the 404 keeps
// the masthead, nav and footer.
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundView />
    </SiteLayout>
  );
}
