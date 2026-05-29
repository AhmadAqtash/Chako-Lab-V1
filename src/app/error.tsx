'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="max-w-screen-md mx-auto px-6 py-24 text-center">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">Something went wrong</p>
      <h1 className="text-heading font-display font-bold mb-4">Oops — we hit a snag</h1>
      <p className="text-sm text-chako-ink/60 mb-8 max-w-sm mx-auto leading-relaxed">
        A temporary error occurred. Try refreshing the page or come back shortly.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center px-6 py-3 bg-chako-ink text-chako-cream font-semibold rounded-2xl text-sm hover:bg-chako-ink/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 border border-black/15 font-semibold rounded-2xl text-sm hover:bg-black/5 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
