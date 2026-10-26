import matter from 'gray-matter';

/**
 * Sets or removes one field — a scalar, or a list written on one line — in a markdown file's frontmatter by editing that
 * line alone. Re-serialising the whole block would re-quote and re-wrap every other
 * field, so a one-word change would show up in the history as a rewrite of the header.
 *
 * Checks its own work: if the file does not read back with the intended value, it
 * throws rather than commit something it did not mean to.
 */
export function setFrontmatterField(source: string, key: string, value: string | boolean | string[] | null): string {
  if (!/^[A-Za-z][\w-]*$/.test(key)) throw new Error(`Bad frontmatter key: ${key}`);
  if (!source.startsWith('---')) throw new Error('The file has no frontmatter block.');
  const end = source.indexOf('\n---', 3);
  if (end === -1) throw new Error('The frontmatter block is not closed.');

  let head = source.slice(0, end);
  const tail = source.slice(end);
  // Every field line follows a newline (the block opens with "---"), so a line is
  // removed together with the newline before it, and added with one: adding then
  // removing gives back the file exactly. Indented lines after it belong to the field (a
  // list written one item per line, a folded string) and go with it.
  const line = new RegExp(`\\n${key}:[^\\n]*(?:\\n[ \\t]+[^\\n]*)*`);

  if (value === null) {
    head = head.replace(line, '');
  } else {
    const rendered = Array.isArray(value)
      ? `[${value.map((item) => JSON.stringify(item)).join(', ')}]`
      : typeof value === 'boolean' || /^[a-z][a-z-]*$/.test(value)
        ? String(value)
        : JSON.stringify(value);
    head = line.test(head) ? head.replace(line, `\n${key}: ${rendered}`) : `${head}\n${key}: ${rendered}`;
  }

  const out = head + tail;
  const readBack = (matter(out).data as Record<string, unknown>)[key];
  const expected = value === null ? undefined : value;
  if (JSON.stringify(readBack) !== JSON.stringify(expected)) {
    throw new Error(`Could not set ${key} cleanly in the frontmatter; nothing was saved.`);
  }
  return out;
}
