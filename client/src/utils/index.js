export const CATEGORIES = [
  'Computer Science',
  'Technology and AI',
  'Hackathons and Opportunities',
  'Psychology and Human Behaviour',
  'Science and Interesting Facts',
  'Current Affairs and World Events',
  'Cinema and Filmography',
  'Anime and Entertainment',
  'History and Culture',
  'Internet Culture and Digital Life',
];

export const CATEGORY_META = {
  'Computer Science': {
    slug: 'computer-science',
    short: 'CS & Systems',
    emoji: '💻',
    color: 'bg-blue-50 text-blue-800 border-blue-100',
    dotColor: 'bg-blue-500',
  },
  'Technology and AI': {
    slug: 'technology-and-ai',
    short: 'Tech & AI',
    emoji: '🤖',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    dotColor: 'bg-emerald-500',
  },
  'Hackathons and Opportunities': {
    slug: 'hackathons-and-opportunities',
    short: 'Opportunities',
    emoji: '🏆',
    color: 'bg-amber-50 text-amber-800 border-amber-100',
    dotColor: 'bg-amber-500',
  },
  'Psychology and Human Behaviour': {
    slug: 'psychology',
    short: 'Psychology',
    emoji: '🧠',
    color: 'bg-rose-50 text-rose-800 border-rose-100',
    dotColor: 'bg-rose-500',
  },
  'Science and Interesting Facts': {
    slug: 'science',
    short: 'Science',
    emoji: '🔬',
    color: 'bg-cyan-50 text-cyan-800 border-cyan-100',
    dotColor: 'bg-cyan-500',
  },
  'Current Affairs and World Events': {
    slug: 'world-affairs',
    short: 'World Affairs',
    emoji: '🌍',
    color: 'bg-slate-50 text-slate-800 border-slate-100',
    dotColor: 'bg-slate-500',
  },
  'Cinema and Filmography': {
    slug: 'cinema',
    short: 'Cinema',
    emoji: '🎬',
    color: 'bg-purple-50 text-purple-800 border-purple-100',
    dotColor: 'bg-purple-500',
  },
  'Anime and Entertainment': {
    slug: 'anime',
    short: 'Anime & Media',
    emoji: '✨',
    color: 'bg-violet-50 text-violet-800 border-violet-100',
    dotColor: 'bg-violet-500',
  },
  'History and Culture': {
    slug: 'history',
    short: 'History',
    emoji: '📜',
    color: 'bg-orange-50 text-orange-800 border-orange-100',
    dotColor: 'bg-orange-500',
  },
  'Internet Culture and Digital Life': {
    slug: 'digital-life',
    short: 'Digital Life',
    emoji: '📱',
    color: 'bg-gray-50 text-gray-800 border-gray-100',
    dotColor: 'bg-gray-500',
  },
};

export const getCategoryMeta = (category) =>
  CATEGORY_META[category] || {
    short: category,
    emoji: '📌',
    color: 'bg-sage text-forest-900 border-forest-100',
    dotColor: 'bg-forest-500',
  };

export const formatCount = (count) => {
  if (!count && count !== 0) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return d.getFullYear().toString();
};

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
};

export const truncate = (str, maxLength = 120) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
};
