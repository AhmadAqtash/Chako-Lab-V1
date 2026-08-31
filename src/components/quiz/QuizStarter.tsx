'use client';

import { useSearchParams } from 'next/navigation';
import QuizFlow from './QuizFlow';
import { Q1 } from '@/lib/quiz/config';

/**
 * Reads the `?start=` handoff from the homepage band so someone who already
 * answered "who is this for?" down there does not get asked it again up here.
 * An unrecognised value is ignored rather than trusted — it comes from the URL.
 */
export default function QuizStarter() {
  const raw = useSearchParams().get('start');
  const startWith = Q1.options.some((o) => o.id === raw) ? (raw as string) : undefined;
  return <QuizFlow startWith={startWith} />;
}
