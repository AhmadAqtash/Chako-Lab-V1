'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Link from '@/components/ui/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, ArrowRight, RotateCcw, Check } from 'lucide-react';
import {
  KIDS_QUESTIONS,
  Q1,
  QUESTIONS,
  text,
  type L,
  type Question,
  type Result,
} from '@/lib/quiz/config';
import { runQuiz, type Answers } from '@/lib/quiz/engine';

// The brand signature is that every product ships as a two-tone colour PAIR.
// The background walks through a different series colourway on each question,
// so the quiz feels like flipping through the range rather than filling a form.
const PAIRS = [
  { soft: 'bg-chako-linlin-soft',   bold: 'bg-chako-linlin',   text: 'text-chako-linlin' },
  { soft: 'bg-chako-bawang-soft',   bold: 'bg-chako-bawang',   text: 'text-chako-bawang' },
  { soft: 'bg-chako-bobo-soft',     bold: 'bg-chako-bobo',     text: 'text-chako-bobo' },
  { soft: 'bg-chako-milkpod-soft',  bold: 'bg-chako-milkpod',  text: 'text-chako-milkpod' },
  { soft: 'bg-chako-kada-soft',     bold: 'bg-chako-kada',     text: 'text-chako-kada' },
  { soft: 'bg-chako-pangpang-soft', bold: 'bg-chako-pangpang', text: 'text-chako-pangpang' },
  { soft: 'bg-chako-titanium-soft', bold: 'bg-chako-titanium', text: 'text-chako-titanium' },
];

// Hard offset shadow + thick ink outline: the "puffed silhouette" form language
// of the products, rather than sharp minimalism fighting it.
const CARD = 'border-2 border-chako-ink rounded-2xl shadow-[4px_4px_0_0_#1a1a1a]';

const quizCss = `
  @keyframes chakoQuizPop {
    0%   { transform: translateY(14px) scale(0.985); opacity: 0; }
    70%  { transform: translateY(-2px) scale(1.004); opacity: 1; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  .chakoQuizIn { animation: chakoQuizPop 420ms cubic-bezier(.22,1,.36,1) both; }
  @media (prefers-reduced-motion: reduce) {
    .chakoQuizIn { animation: none !important; }
  }
`;

interface Props {
  /** Preselected Q1 answer, so the homepage band can start the quiz mid-stride. */
  readonly startWith?: string;
}

export default function QuizFlow({ startWith }: Props) {
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar' : 'en';
  const isAr = locale === 'ar';
  const t = useCallback((l: L) => text(l, locale), [locale]);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    startWith ? { q1: startWith } : {}
  );
  const [step, setStep] = useState(startWith ? 1 : 0);
  const [copied, setCopied] = useState(false);

  // Which questions this person actually sees. Answering "13 or older" on K1
  // drops back into the main path at Q2, exactly as the brief's flow specifies.
  const flow: Question[] = useMemo(() => {
    const q1 = answers.q1 as string | undefined;
    if (!q1) return [Q1];
    const chosen = Q1.options.find((o) => o.id === q1);
    if (chosen?.path !== 'kids') return [Q1, ...QUESTIONS];
    if (answers.k1 === 'teen') return [Q1, KIDS_QUESTIONS[0], ...QUESTIONS];
    return [Q1, ...KIDS_QUESTIONS];
  }, [answers]);

  const done = step >= flow.length;
  const current = flow[step];
  const pair = PAIRS[step % PAIRS.length];

  const choose = (question: Question, optionId: string) => {
    const next = { ...answers, [question.id]: optionId };
    // Changing an earlier answer invalidates everything after it — otherwise a
    // kid-path answer could survive a switch to the main path and score twice.
    for (const later of flow.slice(step + 1)) delete next[later.id];
    setAnswers(next);
    setStep(step + 1);
  };

  const toggle = (question: Question, optionId: string) => {
    const held = (answers[question.id] as string[] | undefined) ?? [];
    const next = held.includes(optionId) ? held.filter((x) => x !== optionId) : [...held, optionId];
    setAnswers({ ...answers, [question.id]: next });
  };

  const finish = () => setStep(flow.length);

  // Fire on ENTERING the result, not from the Q11 button. The kids path ends on
  // an ordinary single-select and never presses that button, so hanging the
  // event off it silently lost every kids completion — about a quarter of runs.
  const fired = useRef(false);
  useEffect(() => {
    if (!done || fired.current) return;
    fired.current = true;
    const { analytics } = runQuiz(answers as Answers);
    // GA4 via the GTM dataLayer already on the page. Within a month this says
    // which archetype the traffic actually is — a merchandising signal well
    // beyond the quiz itself.
    (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
      event: 'quiz_complete',
      ...analytics,
    });
  }, [done, answers]);

  const restart = () => {
    fired.current = false;
    setAnswers({});
    setStep(0);
    setCopied(false);
  };

  if (done) {
    const { result, scored } = runQuiz(answers as Answers);
    return (
      <ResultCard
        result={result}
        gift={scored.gift}
        pairings={scored.pairings}
        t={t}
        isAr={isAr}
        copied={copied}
        onCopy={() => {
          navigator.clipboard?.writeText(t(result.shareLine)).then(
            () => setCopied(true),
            () => undefined
          );
        }}
        onRestart={restart}
      />
    );
  }

  const held = (answers[current.id] as string[] | undefined) ?? [];
  // Until Q1 is answered the flow is just [Q1], which would render a demoralising
  // "Question 1 of 1". Assume the main path — the longer, more common one — and
  // let it shorten to "of 4" if they pick the kids route.
  const total = answers.q1 ? flow.length : 1 + QUESTIONS.length;
  const progress = Math.round((step / total) * 100);

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="max-w-xl mx-auto">
      <style>{quizCss}</style>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-chako-ink/40">
            {isAr ? `سؤال ${step + 1} من ${total}` : `Question ${step + 1} of ${total}`}
          </span>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-chako-ink/40 hover:text-chako-ink transition-colors min-h-[44px] touch-manipulation"
            >
              {isAr ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
              {isAr ? 'رجوع' : 'Back'}
            </button>
          )}
        </div>
        <div className="h-2 rounded-full bg-chako-ink/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${pair.bold} transition-[width] duration-500 ease-out`}
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div key={current.id} className="chakoQuizIn">
        <h2 className="text-heading font-display font-bold leading-tight mb-2">
          {t(current.prompt)}
        </h2>
        {current.sub && (
          <p className="text-sm text-chako-ink/55 leading-relaxed mb-6">{t(current.sub)}</p>
        )}
        {!current.sub && <div className="mb-6" />}

        <div className="flex flex-col gap-3">
          {current.options.map((opt, i) => {
            const optPair = PAIRS[(step + i) % PAIRS.length];
            const selected = current.multi
              ? held.includes(opt.id)
              : answers[current.id] === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => (current.multi ? toggle(current, opt.id) : choose(current, opt.id))}
                className={`group ${CARD} ${selected ? optPair.bold : optPair.soft} px-5 py-4 text-start
                  flex items-center gap-3 min-h-[60px] touch-manipulation
                  transition-[transform,box-shadow] duration-150
                  hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1a1a1a]
                  active:translate-y-0 active:shadow-[2px_2px_0_0_#1a1a1a]`}
              >
                <span
                  className={`flex-none w-5 h-5 rounded-full border-2 border-chako-ink flex items-center justify-center
                    ${selected ? 'bg-chako-ink' : 'bg-white'}`}
                >
                  {selected && <Check size={12} className="text-white" strokeWidth={4} />}
                </span>
                <span className="font-semibold text-[15px] leading-snug text-chako-ink">
                  {t(opt.label)}
                </span>
              </button>
            );
          })}
        </div>

        {current.multi && (
          <button
            onClick={finish}
            className={`${CARD} bg-chako-ink text-chako-cream w-full mt-5 py-4 font-display font-bold text-base
              flex items-center justify-center gap-2 min-h-[56px] touch-manipulation
              transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0`}
          >
            {isAr ? 'أرني النتيجة' : 'Show me my Chako'}
            {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────────────────

function ResultCard({
  result,
  gift,
  pairings,
  t,
  isAr,
  copied,
  onCopy,
  onRestart,
}: {
  result: Result;
  gift: boolean;
  pairings: readonly L[];
  t: (l: L) => string;
  isAr: boolean;
  copied: boolean;
  onCopy: () => void;
  onRestart: () => void;
}) {
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="max-w-xl mx-auto chakoQuizIn">
      <style>{quizCss}</style>
      <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-chako-ink/40 mb-2">
        {/* The gift flag changes the framing and nothing else. */}
        {gift
          ? isAr ? 'مطابقتهم' : 'Their match'
          : isAr ? 'مطابقتك' : 'Your match'}
      </p>

      <h2 className="text-display font-display font-bold leading-none mb-2">{t(result.persona)}</h2>
      <p className="text-body text-chako-ink/70 mb-1">{t(result.product)}</p>
      <p className="font-display font-bold text-xl mb-5">{t(result.price)}</p>

      {/* Spec pills — mono utility face, echoing the chips on the live PDPs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {result.pills.map((pill) => (
          <span
            key={pill.en}
            className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border-2 border-chako-ink bg-white"
          >
            {t(pill)}
          </span>
        ))}
      </div>

      <div className={`${CARD} bg-chako-linlin-soft px-5 py-5 mb-5`}>
        <p className="font-display font-bold text-lg leading-snug">{t(result.verdict)}</p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {result.points.map((point) => (
          <div key={point.label.en} className={`${CARD} bg-white px-5 py-4`}>
            <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-chako-ink/40 mb-1.5">
              {t(point.label)}
            </p>
            <p className="text-sm leading-relaxed text-chako-ink/80">{t(point.body)}</p>
          </div>
        ))}
      </div>

      <div className={`${CARD} bg-chako-bobo-soft px-5 py-4 mb-3`}>
        <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-chako-ink/40 mb-1.5">
          {isAr ? 'أضف إليه' : 'Pair it with'}
        </p>
        <p className="text-sm leading-relaxed text-chako-ink/80">{t(result.pairWith)}</p>
        {/* Q11 appends. Pure basket-builder — never changes the main result. */}
        {pairings.map((extra) => (
          <p key={extra.en} className="text-sm leading-relaxed text-chako-ink/80 mt-2">
            {t(extra)}
          </p>
        ))}
      </div>

      {/* CTA goes to the COLLECTION, never a product page — colourways sell out
          constantly and a dead PDP kills the conversion. */}
      <Link
        href={`/collections/${result.collection}`}
        className={`${CARD} bg-chako-ink text-chako-cream w-full py-4 font-display font-bold text-base
          flex items-center justify-center gap-2 min-h-[56px] touch-manipulation
          transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 mb-3`}
      >
        {isAr ? 'تسوّق المجموعة' : 'Shop the collection'}
        {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
      </Link>

      <div className="flex gap-3">
        <button
          onClick={onCopy}
          className={`${CARD} bg-white flex-1 py-3 text-sm font-bold min-h-[48px] touch-manipulation
            transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0`}
        >
          {copied
            ? isAr ? 'تم النسخ ✓' : 'Copied ✓'
            : isAr ? 'انسخ للمشاركة' : 'Copy share line'}
        </button>
        <button
          onClick={onRestart}
          className={`${CARD} bg-white px-5 py-3 text-sm font-bold min-h-[48px] touch-manipulation
            flex items-center gap-2 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0`}
        >
          <RotateCcw size={14} />
          {isAr ? 'أعد' : 'Retake'}
        </button>
      </div>

      <p className="mt-4 text-xs text-chako-ink/40 italic leading-relaxed">
        &ldquo;{t(result.shareLine)}&rdquo;
      </p>
    </div>
  );
}
