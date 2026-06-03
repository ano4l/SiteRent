export default function AdminLoading() {
  return (
    <div className="space-y-6 xl:space-y-8" aria-busy="true" aria-label="Loading admin dashboard">
      <div className="h-40 animate-pulse rounded-[32px] border border-[#e1d8ca] bg-white" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[24px] border border-[#e1d8ca] bg-white" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[28px] border border-[#e1d8ca] bg-white" />
    </div>
  );
}
