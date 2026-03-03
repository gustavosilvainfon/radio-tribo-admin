'use client';

export default function StatusAlert({ status, onClose }) {
  if (!status || !status.message) return null;

  const baseClasses =
    'mb-4 rounded-lg px-4 py-3 text-sm flex items-center justify-between shadow-lg border';
  const typeClasses =
    status.type === 'error'
      ? 'bg-red-900/70 border-red-500/70 text-red-100'
      : 'bg-green-900/70 border-green-500/70 text-green-100';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span>{status.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 text-xs text-gray-200 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}


