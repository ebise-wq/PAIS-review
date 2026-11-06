/**
 * Numbers about how a review was made, taken from the Claude Code session transcript (one
 * JSON object per line). Pure functions; scripts/session-stats.mjs does the file work.
 */

export interface TokenTotals {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  /** The part of cacheWrite kept for an hour, which costs more. Absent in older records. */
  cacheWrite1h?: number;
}

export interface SessionTotals {
  tokens: TokenTotals;
  /** The same totals for each model that ran, so each can be priced at its own rate. */
  byModel: Record<string, TokenTotals>;
  /** Model calls counted. */
  calls: number;
  /** Active minutes: time between events, leaving out pauses longer than ten minutes. */
  minutes: number;
}

type Usage = Record<string, unknown> & { cache_creation?: { ephemeral_1h_input_tokens?: number } };

const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/**
 * Adds up token use across transcript lines. The transcript writes one line per content
 * block, each repeating the usage of the model call it belongs to, so a call is counted
 * once, by its message id; the last line seen for it wins, being the most complete.
 */
export function sumUsage(lines: Iterable<string>): SessionTotals {
  const calls = new Map<string, { usage: Usage; model: string }>();
  const times: number[] = [];
  for (const line of lines) {
    let entry: { type?: string; timestamp?: string; message?: { id?: string; model?: string; usage?: Usage } };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const time = entry.timestamp ? Date.parse(entry.timestamp) : NaN;
    if (Number.isFinite(time)) times.push(time);
    const usage = entry.message?.usage;
    if (entry.type === 'assistant' && usage && entry.message?.id) {
      calls.set(entry.message.id, { usage, model: entry.message.model ?? 'unknown' });
    }
  }

  const empty = (): TokenTotals => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 });
  const tokens = empty();
  const byModel: Record<string, TokenTotals> = {};
  for (const { usage, model } of calls.values()) {
    const forModel = (byModel[model] ??= empty());
    for (const sum of [tokens, forModel]) {
      sum.input += num(usage.input_tokens);
      sum.output += num(usage.output_tokens);
      sum.cacheRead += num(usage.cache_read_input_tokens);
      sum.cacheWrite += num(usage.cache_creation_input_tokens);
      sum.cacheWrite1h = (sum.cacheWrite1h ?? 0) + num(usage.cache_creation?.ephemeral_1h_input_tokens);
    }
  }
  // Claude Code writes some lines itself, marked "<synthetic>"; they cost nothing.
  delete byModel['<synthetic>'];

  // A session can sit open for days waiting for a reply; that is not time spent on the review.
  const PAUSE = 10 * 60000;
  times.sort((a, b) => a - b);
  let active = 0;
  for (let i = 1; i < times.length; i++) active += Math.min(times[i] - times[i - 1], PAUSE);
  const minutes = Math.round(active / 60000);
  return { tokens, byModel, calls: calls.size, minutes };
}

/** The claude.ai address of a cloud session, from the id Claude Code gives it ("cse_…"). */
export function sessionUrl(remoteId: string | undefined): string | undefined {
  const match = remoteId ? /^cse_([A-Za-z0-9]+)$/.exec(remoteId) : null;
  return match ? `https://claude.ai/code/session_${match[1]}` : undefined;
}
