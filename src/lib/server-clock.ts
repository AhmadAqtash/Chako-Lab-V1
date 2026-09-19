// The shopper's device clock is not evidence. A phone set three hours wrong
// would show a countdown to a cutoff that has already passed — a delivery
// promise the store cannot keep. So the countdown never trusts the device
// clock alone: it corrects it with the `Date` header of a response from OUR
// server, and until that correction exists every surface shows the safe,
// clock-free wording.
//
// The cart API is called on every page load anyway (CartContext.initCart), so
// this costs no extra request.

const MAX_RTT_MS = 5000;

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
    // A request that straddles a tab freeze, a stalled connection or a device
    // clock step is not evidence: its midpoint can sit MINUTES from the moment
    // the server stamped the header — and a clock that runs behind is the unsafe
    // direction (it shows a cutoff as still open). Discard it. With no earlier
    // sample the surfaces stay on the safe wording; with one, that offset is
    // still valid (a freeze does not change server-minus-device).
    // Both timestamps stay on Date.now(): performance.now() can pause during
    // suspension on iOS and would hide exactly the freeze being detected.
    const rtt = received - requestStartedAt;
    if (!(rtt >= 0 && rtt <= MAX_RTT_MS)) return;
    // The Date header has 1s resolution and is stamped when the response was
    // generated; centre it in the round-trip. With rtt <= 5s that is good to
    // ~3s, far inside the 60-second early-flip guard in lib/dispatch.ts.
    // The LATEST plausible sample wins (not the "best"): if the device clock is
    // corrected mid-session, a pinned old offset would stay wrong for good.
    const next = server + 500 - (requestStartedAt + rtt / 2);
    // HYSTERESIS. The Date header has 1-second resolution, so every sample is
    // ±~1s of noise around the truth. Re-basing on each cart response made a
    // visible SECONDS countdown step backwards after an add — and a timer that
    // stutters looks fake. A new sample only replaces the offset when it
    // disagrees by 2s or more, i.e. when the device clock really moved.
    if (offsetMs !== null && Math.abs(next - offsetMs) < 2000) return;
    offsetMs = next;
    listeners.forEach((l) => l());
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
