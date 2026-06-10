import { notFound } from 'next/navigation';

// Any path under a valid locale that matches no real route → localized 404.
export default function CatchAll() {
  notFound();
}
