// Shown inside the dashboard shell while a page's data loads.
export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse motion-reduce:animate-none">
      <div className="mb-8 border-b border-ink pb-5">
        <div className="h-3 w-24 bg-rule" />
        <div className="mt-3 h-11 w-64 bg-paper-2" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-rule pb-4">
            <div className="h-3 w-20 bg-rule" />
            <div className="mt-2 h-6 w-3/4 bg-paper-2" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
