export const SkeletonPost = () => (
  <div className="card p-4 space-y-4 animate-skeleton">
    {/* Author row */}
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-32 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
    {/* Image */}
    <div className="skeleton w-full h-52 rounded-xl" />
    {/* Title */}
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3.5 w-full rounded" />
    <div className="skeleton h-3.5 w-5/6 rounded" />
    {/* Actions */}
    <div className="flex gap-4 pt-1">
      <div className="skeleton h-8 w-16 rounded-lg" />
      <div className="skeleton h-8 w-16 rounded-lg" />
      <div className="skeleton h-8 w-16 rounded-lg" />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="space-y-6 animate-skeleton">
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-3.5 w-28 rounded" />
          <div className="skeleton h-3 w-full rounded" />
        </div>
      </div>
    </div>
    {[1, 2, 3].map(i => <SkeletonPost key={i} />)}
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card animate-skeleton">
        <div className="skeleton w-full h-32 rounded-none" />
        <div className="p-3 space-y-2">
          <div className="skeleton h-3.5 w-3/4 rounded" />
          <div className="skeleton h-3 w-full rounded" />
        </div>
      </div>
    ))}
  </div>
);
