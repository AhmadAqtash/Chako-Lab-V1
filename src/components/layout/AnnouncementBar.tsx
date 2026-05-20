'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Free shipping on orders over AED 250',
  'Crafted for those who love their morning ritual',
  'All products by Chako Lab — made to last',
  'New arrivals: BoBo Tumblers & LinLin Kettles',
  'Shop now, pay later with Tabby & Tamara',
];

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-chako-dark text-chako-bg text-xs text-center py-2 px-4 font-medium tracking-wide">
      <span
        className="inline-block transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {MESSAGES[idx]}
      </span>
    </div>
  );
}
