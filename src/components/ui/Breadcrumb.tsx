import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: Props) {
  return (
    <nav className="flex items-center gap-1 text-xs text-chako-ink/40 mb-6 min-w-0 overflow-hidden" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className={`flex items-center gap-1 ${isLast ? 'min-w-0' : 'flex-shrink-0'}`}>
            {i > 0 && <ChevronRight size={12} className="flex-shrink-0" />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-chako-ink transition-colors whitespace-nowrap">
                {crumb.label}
              </Link>
            ) : (
              <span className={`text-chako-ink/70 font-medium${isLast ? ' truncate' : ''}`}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
