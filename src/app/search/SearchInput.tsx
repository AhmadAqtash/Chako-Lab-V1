'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useTransition } from 'react';

interface Props {
  initialQuery: string;
}

export default function SearchInput({ initialQuery }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-chako-dark/40 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search kettles, bottles, mugs..."
        className="w-full pl-11 pr-4 py-3.5 bg-chako-accent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-chako-dark/20 placeholder:text-chako-dark/35"
        autoFocus
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-chako-dark/20 border-t-chako-dark rounded-full animate-spin" />
        </div>
      )}
    </form>
  );
}
