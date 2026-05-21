'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function AnnouncementBar() {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const messages = [t('announce_1'), t('announce_2'), t('announce_3')];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-chako-dark text-chako-bg text-xs text-center py-2 px-4 font-medium tracking-wide">
      <span
        className="inline-block transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {messages[idx]}
      </span>
    </div>
  );
}
