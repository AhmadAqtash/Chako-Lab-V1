'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import SocialLinks from '@/components/ui/SocialLinks';

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
    <div className="bg-chako-ink text-chako-cream text-xs font-medium tracking-wide">
      <div className="relative flex items-center justify-center py-2 px-16">
        {/* Official socials — pinned to the start edge (mirrors in RTL) */}
        <SocialLinks
          size={15}
          className="absolute start-3 top-1/2 -translate-y-1/2 gap-0.5"
          linkClassName="p-1.5 text-chako-cream/75 hover:text-chako-cream motion-safe:hover:animate-wobble transition-colors duration-150 touch-manipulation"
        />
        <span
          className="inline-block text-center transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {messages[idx]}
        </span>
      </div>
    </div>
  );
}
