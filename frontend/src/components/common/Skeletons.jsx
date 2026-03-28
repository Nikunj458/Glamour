export function ProductSkeleton() {
  return (
    <div className="bg-white">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="p-2.5 space-y-1.5">
        <div className="skeleton h-2.5 w-14" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3.5 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
      {Array.from({ length: count }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  );
}