import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl font-bold text-chako-dark/10 mb-4">404</p>
      <h1 className="text-xl font-bold mb-2">Page not found</h1>
      <p className="text-sm text-chako-dark/50 mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-chako-dark text-chako-bg font-semibold text-sm rounded-full hover:bg-chako-dark/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
