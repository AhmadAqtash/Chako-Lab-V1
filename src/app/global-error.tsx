'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#FAFAF8', color: '#171717', margin: 0 }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '12px' }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Oops — we hit a snag
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '32px', lineHeight: 1.6 }}>
            A temporary error occurred. Try refreshing the page or come back shortly.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              background: '#171717',
              color: '#FAFAF8',
              border: 'none',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
