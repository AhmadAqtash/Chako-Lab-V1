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
    <nav className="flex items-center gap-1 text-xs text-chako-dark/40 mb-6" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="flex-shrink-0" />}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-chako-dark transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-chako-dark/70 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
