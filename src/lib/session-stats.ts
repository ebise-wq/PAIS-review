/**
 * Numbers about how a review was made, taken from the Claude Code session transcript (one
 * JSON object per line). Pure functions; scripts/session-stats.mjs does the file work.
 */

export interface TokenTotals {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export interface SessionTotals {
  tokens: TokenTotals;
  /** Model calls counted. */
  calls: number;
  /** Active minutes: time between events, leaving out pauses longer than ten minutes. */
  minutes: number;
}

/**
 * Adds up token use across transcript lines. The transcript writes one line per content
 * block, each repeating the usage of the model call it belongs to, so a call is counted
 * once, by its message id; the last line seen for it wins, being the most complete.
 */
export function sumUsage(lines: Iterable<string>): SessionTotals {
  const calls = new Map<string, Record<string, number>>();
  const times: number[] = [];
  for (const line of lines) {
    let entry: { type?: string; timestamp?: string; message?: { id?: string; usage?: Record<string, number> } };
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const time = entry.timestamp ? Date.parse(entry.timestamp) : NaN;
    if (Number.isFinite(time)) times.push(time);
    const usage = entry.message?.usage;
    if (entry.type === 'assistant' && usage && entry.message?.id) calls.set(entry.message.id, usage);
  }

  const tokens: TokenTotals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  for (const usage of calls.values()) {
    tokens.input += usage.input_tokens ?? 0;
    tokens.output += usage.output_tokens ?? 0;
    tokens.cacheRead += usage.cache_read_input_tokens ?? 0;
    tokens.cacheWrite += usage.cache_creation_input_tokens ?? 0;
  }
  // A session can sit open for days waiting for a reply; that is not time spent on the review.
  const PAUSE = 10 * 60000;
  times.sort((a, b) => a - b);
  let active = 0;
  for (let i = 1; i < times.length; i++) active += Math.min(times[i] - times[i - 1], PAUSE);
  const minutes = Math.round(active / 60000);
  return { tokens, calls: calls.size, minutes };
}

/** The claude.ai address of a cloud session, from the id Claude Code gives it ("cse_…"). */
export function sessionUrl(remoteId: string | undefined): string | undefined {
  const match = remoteId ? /^cse_([A-Za-z0-9]+)$/.exec(remoteId) : null;
  return match ? `https://claude.ai/code/session_${match[1]}` : undefined;
}
