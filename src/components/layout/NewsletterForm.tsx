'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function NewsletterForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-chako-cream/60">{t('footer_thanks')}</p>
    );
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('footer_email_placeholder')}
        className="flex-1 bg-white/10 text-chako-cream placeholder:text-chako-cream/40 text-sm px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 min-w-0"
      />
      <button
        type="submit"
        className="px-3 py-2 bg-chako-cream text-chako-ink text-sm font-semibold rounded-xl hover:bg-chako-cream/90 transition-colors flex-shrink-0"
      >
        {t('footer_join')}
      </button>
    </form>
  );
}
