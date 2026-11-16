/**
 * The pure parts of `scripts/catalogue-query.mjs`: checking a query only reads, and printing
 * rows. The database role sessions use can only read anyway; this check gives a clear message
 * instead of a permission error, and stops a pasted script running several statements.
 */

/** The SQL with comments removed and surrounding space and a final semicolon trimmed. */
export function cleanSql(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .trim()
    .replace(/;\s*$/, '')
    .trim();
}

/** Null if the query is a single read-only statement, otherwise the reason it is refused. */
export function refuseUnlessReadOnly(sql: string): string | null {
  const clean = cleanSql(sql);
  if (!clean) return 'The query is empty.';
  // A semicolon outside quotes means a second statement.
  const outsideQuotes = clean.replace(/'(?:[^']|'')*'|"(?:[^"]|"")*"/g, "''");
  if (outsideQuotes.includes(';')) return 'One statement at a time.';
  if (!/^(select|with|explain|table|values)\b/i.test(clean)) return 'Only queries that read (SELECT, WITH, EXPLAIN) are allowed.';
  if (/^with\b/i.test(clean) && /\b(insert|update|delete|merge|truncate)\b/i.test(outsideQuotes)) {
    return 'Only queries that read are allowed.';
  }
  return null;
}

const cell = (value: unknown): string => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.join('; ');
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/** Rows as a plain text table, each column cut to `width` characters so long titles stay readable. */
export function formatTable(rows: Record<string, unknown>[], width = 60): string {
  if (!rows.length) return '(no rows)\n';
  const columns = Object.keys(rows[0]);
  const cut = (text: string) => (text.length > width ? `${text.slice(0, width - 1)}…` : text).replace(/\s+/g, ' ');
  const body = rows.map((row) => columns.map((c) => cut(cell(row[c]))));
  const widths = columns.map((c, i) => Math.max(c.length, ...body.map((r) => r[i].length)));
  const line = (values: string[]) => values.map((v, i) => v.padEnd(widths[i])).join(' | ').trimEnd();
  return [line(columns), widths.map((w) => '-'.repeat(w)).join('-+-'), ...body.map(line)].join('\n') + '\n';
}

/** Rows as CSV, every value in full. */
export function formatCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const columns = Object.keys(rows[0]);
  const quote = (text: string) => (/[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text);
  return [columns.join(','), ...rows.map((row) => columns.map((c) => quote(cell(row[c]))).join(','))].join('\n') + '\n';
}
