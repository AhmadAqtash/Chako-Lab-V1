import type { ReactNode } from 'react';
import { Fragment } from 'react';

/**
 * Fill a translation template's {placeholders} with React nodes, so a dynamic
 * value can carry its own markup (<bdi>, weight, tabular figures) without the
 * sentence being chopped into separately-translated halves — which breaks in
 * Arabic, where the value often sits mid-sentence.
 *
 *   fill('Order within {time}', { time: <bdi>2h 14m</bdi> })
 */
export function fill(template: string, parts: Record<string, ReactNode>): ReactNode[] {
  return template.split(/(\{\w+\})/g).map((chunk, i) => {
    const key = chunk.match(/^\{(\w+)\}$/)?.[1];
    return <Fragment key={i}>{key && key in parts ? parts[key] : chunk}</Fragment>;
  });
}

/** Plain-string version, for aria-labels. */
export function fillText(template: string, parts: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in parts ? parts[key] : m));
}
