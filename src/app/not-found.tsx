import EmptyState from "@/components/EmptyState";
import SiteButton from "@/components/SiteButton";

export default function NotFound() {
  return (
    <main className="px-6 py-16">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        sticker={
          <svg viewBox="0 0 48 48" className="h-12 w-12 text-cherry" aria-hidden>
            <path
              d="M8 14c6 0 6 6 12 6s6-6 12-6 6 6 12 6"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <path
              d="M10 30c5 0 5 5 10 5"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="1 6"
            />
            <circle cx="36" cy="34" r="3" fill="currentColor" />
          </svg>
        }
        heading="Lost the thread."
        note="this page wandered off — let's get you back"
        action={
          <SiteButton href="/" label="Home">
            Back to the edit
          </SiteButton>
        }
        showCategories
      />
    </main>
  );
}
