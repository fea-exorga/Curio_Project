import { getCategoryMeta } from '../../utils/index.js';

export const CategoryBadge = ({ category, size = 'sm' }) => {
  const meta = getCategoryMeta(category);
  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${meta.color} ${sizeClasses}`}
    >
      <span>{meta.emoji}</span>
      <span>{meta.short}</span>
    </span>
  );
};

export const CategoryDot = ({ category, className = '' }) => {
  const meta = getCategoryMeta(category);
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${meta.dotColor} ${className}`}
      title={category}
    />
  );
};
