/**
 * What a review's tokens would cost at Anthropic's list prices for the API, in US dollars.
 * Worked out when the page is built, from the prices below, so every review is shown at
 * today's prices rather than the ones in force when it was written. When prices change,
 * update the table and the date with it.
 *
 * A Claude Code session on a subscription is not billed this way; the figure is what the
 * same work would cost through the API.
 */
import type { TokenTotals } from './session-stats';

/** When the prices below were last checked against Anthropic's published prices. */
export const PRICES_CHECKED = '2026-10-06';

/** US dollars per million tokens. Cache writes are priced from `input` (see below). */
interface Price {
  input: number;
  output: number;
  cacheRead: number;
}

export const PRICES: Record<string, Price> = {
  'claude-fable-5-1': { input: 10, output: 50, cacheRead: 0.25 },
  'claude-fable-5': { input: 10, output: 50, cacheRead: 1 },
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
  'claude-opus-5': { input: 5, output: 25, cacheRead: 0.5 },
  'claude-opus-4-8': { input: 5, output: 25, cacheRead: 0.5 },
  'claude-opus-4-7': { input: 5, output: 25, cacheRead: 0.5 },
  'claude-opus-4-6': { input: 5, output: 25, cacheRead: 0.5 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-sonnet-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-sonnet-4-6': { input: 3, output: 15, cacheRead: 0.3 },
  // Haiku 5.5 costs five times as much for prompts over 100,000 tokens. Most prompts in a
  // review session are that long, so it is priced at the higher rate.
  'claude-haiku-5-5': { input: 0.5, output: 2.5, cacheRead: 0.05 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheRead: 0.1 },
};

/** A cache write costs 1.25 times the input price for a five-minute cache, twice for an hour. */
const WRITE_5M = 1.25;
const WRITE_1H = 2;

/** "claude-opus-5-5[1m]" or "anthropic.claude-opus-5-5" → "claude-opus-5-5"; unknown → undefined. */
export function priceKey(model: string | undefined): string | undefined {
  if (!model) return undefined;
  const id = model
    .trim()
    .toLowerCase()
    .replace(/\[.*\]$/, '')
    .replace(/^.*?(?=claude-)/, '');
  return PRICES[id] ? id : undefined;
}

/**
 * The cost of one model's tokens. Cache writes not split by duration (`cacheWrite1h`
 * absent) are counted as one-hour writes, which is what Claude Code uses.
 */
export function costOf(tokens: TokenTotals, model: string | undefined): number | undefined {
  const key = priceKey(model);
  if (!key) return undefined;
  const price = PRICES[key];
  const oneHour = Math.min(tokens.cacheWrite1h ?? tokens.cacheWrite, tokens.cacheWrite);
  const fiveMinute = tokens.cacheWrite - oneHour;
  const dollars =
    tokens.input * price.input +
    tokens.output * price.output +
    tokens.cacheRead * price.cacheRead +
    fiveMinute * price.input * WRITE_5M +
    oneHour * price.input * WRITE_1H;
  return dollars / 1e6;
}

/**
 * The cost of a whole session. With a per-model breakdown, each model is priced at its own
 * rate; without one (older records), all tokens are priced as the review's own model.
 * Undefined if any model in it has no price, rather than a figure that leaves part out.
 */
export function sessionCost(
  totals: TokenTotals,
  byModel: Record<string, TokenTotals> | undefined,
  reviewModel: string | undefined,
): number | undefined {
  if (!byModel || Object.keys(byModel).length === 0) return costOf(totals, reviewModel);
  let sum = 0;
  for (const [model, tokens] of Object.entries(byModel)) {
    const cost = costOf(tokens, model);
    if (cost === undefined) return undefined;
    sum += cost;
  }
  return sum;
}

/** 3.456 → "$3.46"; 0.042 → "$0.04"; under half a cent → "under $0.01". */
export function formatDollars(n: number): string {
  if (n < 0.005) return 'under $0.01';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
