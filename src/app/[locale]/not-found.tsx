import Link from '@/components/ui/LocalizedLink';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-display font-display font-bold text-chako-ink/10 mb-4">404</p>
      <h1 className="text-heading font-display font-bold mb-2">Page not found</h1>
      <p className="text-sm text-chako-ink/50 mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-chako-ink text-chako-cream font-semibold text-sm rounded-full hover:bg-chako-ink/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
