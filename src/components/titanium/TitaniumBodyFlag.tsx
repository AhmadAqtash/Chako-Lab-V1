'use client';
import { useEffect } from 'react';

// Sets data-titanium on <body> while a titanium page is mounted; cleans up on leave.
export default function TitaniumBodyFlag() {
  useEffect(() => {
    document.body.setAttribute('data-titanium', 'true');
    return () => { document.body.removeAttribute('data-titanium'); };
  }, []);
  return null;
}
