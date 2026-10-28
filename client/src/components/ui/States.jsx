import { AlertCircle, RefreshCw } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-sage border-t-forest-900 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const ErrorState = ({ message, onRetry, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
        <AlertCircle size={16} className="shrink-0" />
        <span>{message || 'Something went wrong.'}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto text-red-700 hover:text-red-900 font-medium flex items-center gap-1"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="font-semibold text-ink mb-1">Something went wrong</h3>
      <p className="text-sm text-muted max-w-xs mb-6">
        {message || 'We ran into an issue loading this content. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon, title, description, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-sage/60 flex items-center justify-center mb-4 text-3xl">
      {icon || '✨'}
    </div>
    <h3 className="font-semibold text-ink mb-1.5">{title}</h3>
    {description && (
      <p className="text-sm text-muted max-w-xs mb-6">{description}</p>
    )}
    {action && actionLabel && (
      <button onClick={action} className="btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);

export const Toast = ({ message, type = 'success', onClose }) => {
  const styles = {
    success: 'bg-forest-900 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-ink text-white',
  };

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl
                  text-sm font-medium shadow-modal animate-slide-up flex items-center gap-2 max-w-sm
                  ${styles[type] || styles.info}`}
    >
      {message}
      {onClose && (
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">×</button>
      )}
    </div>
  );
};
