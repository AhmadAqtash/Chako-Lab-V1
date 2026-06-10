'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  initialQuery: string;
}

export default function SearchInput({ initialQuery }: Props) {
  const router = useRouter();
  const { t, isRTL, language } = useLanguage();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(() => {
      router.push(`/${language}/search?q=${encodeURIComponent(value.trim())}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <Search
        size={20}
        className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-chako-ink/40 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('search_placeholder')}
        className="w-full min-h-[56px] pl-12 pr-4 rtl:pl-4 rtl:pr-12 py-4 bg-chako-accent rounded-2xl text-base md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-chako-ink/30 placeholder:text-chako-ink/35"
        autoFocus
      />
      {isPending && (
        <div className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-chako-ink/20 border-t-chako-ink rounded-full animate-spin" />
        </div>
      )}
    </form>
  );
}
