export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f2f4f8] p-5 md:p-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden h-[80vh] animate-pulse rounded-2xl bg-white/70 lg:block" />
        <div className="space-y-6">
          <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
    </div>
  );
}
