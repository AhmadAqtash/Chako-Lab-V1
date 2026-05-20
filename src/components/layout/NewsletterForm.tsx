'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-chako-bg/60">Thanks for subscribing!</p>
    );
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-white/10 text-chako-bg placeholder:text-chako-bg/40 text-sm px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 min-w-0"
      />
      <button
        type="submit"
        className="px-3 py-2 bg-chako-bg text-chako-dark text-sm font-semibold rounded-xl hover:bg-chako-bg/90 transition-colors flex-shrink-0"
      >
        Join
      </button>
    </form>
  );
}
