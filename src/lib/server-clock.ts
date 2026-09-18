// The shopper's device clock is not evidence. A phone set three hours wrong
// would show a countdown to a cutoff that has already passed — a delivery
// promise the store cannot keep. So the countdown never trusts the device
// clock alone: it corrects it with the `Date` header of a response from OUR
// server, and until that correction exists every surface shows the safe,
// clock-free wording.
//
// The cart API is called on every page load anyway (CartContext.initCart), so
// this costs no extra request.

let offsetMs: number | null = null;
const listeners = new Set<() => void>();

/** Record the offset from a server response. Call right after the fetch resolves. */
export function noteServerDate(res: Response, requestStartedAt: number): void {
  try {
    const header = res.headers.get('date');
    if (!header) return;
    // A response served from a cache keeps the ORIGIN's Date and reports how
    // old it is in Age — that Date is the past, not now. Only trust fresh ones.
    const age = Number(res.headers.get('age') ?? 0);
    if (Number.isFinite(age) && age > 0) return;
    const server = Date.parse(header);
    if (!Number.isFinite(server)) return;
    const received = Date.now();
    // The Date header has 1s resolution and is stamped when the response was
    // generated; centre it in the round-trip. Good to a second or two, which is
    // far inside the 60-second early-flip guard in lib/dispatch.ts.
    const midpoint = requestStartedAt + (received - requestStartedAt) / 2;
    const next = server + 500 - midpoint;
    const first = offsetMs === null;
    offsetMs = next;
    if (first) listeners.forEach((l) => l());
  } catch {
    // no offset → surfaces stay on the safe wording
  }
}

export function serverOffsetMs(): number | null {
  return offsetMs;
}

/** Server-corrected "now", or null while the offset is still unknown. */
export function serverNow(): Date | null {
  return offsetMs === null ? null : new Date(Date.now() + offsetMs);
}

export function onServerClockReady(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
