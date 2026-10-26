import { query } from './db';

/**
 * A complete copy of everything readers have added: comments, their earlier texts, votes,
 * ratings, and what moderation removed. Includes the browser tokens and network addresses
 * used for one-vote-each and rate limits, so it is for the editor only, never public.
 */
export const BACKUP_TABLES = ['comments', 'comment_edits', 'comment_votes', 'ratings', 'comments_removed'] as const;
export type BackupTable = (typeof BACKUP_TABLES)[number];

export interface Backup {
  kind: 'pais-review-backup';
  version: 1;
  exportedAt: string;
  tables: Record<BackupTable, Record<string, unknown>[]>;
}

export async function exportAll(): Promise<Backup> {
  const tables = {} as Backup['tables'];
  for (const table of BACKUP_TABLES) {
    // Parents before replies, so a restore can insert rows in this order.
    tables[table] = await query(`select * from ${table} order by 1, 2`);
  }
  return { kind: 'pais-review-backup', version: 1, exportedAt: new Date().toISOString(), tables };
}

/**
 * Puts a backup back. Rows already there are left alone, so restoring into a database that
 * still has some of them only adds what is missing. Returns how many rows were added per table.
 */
export async function restoreAll(backup: Backup): Promise<Record<BackupTable, number>> {
  if (backup?.kind !== 'pais-review-backup' || backup.version !== 1) throw new Error('This is not a PAIS Review backup.');
  const added = {} as Record<BackupTable, number>;
  for (const table of BACKUP_TABLES) {
    added[table] = 0;
    // Comments by id, so every parent exists before its replies.
    const rows = [...(backup.tables[table] ?? [])];
    if (table === 'comments') rows.sort((a, b) => Number(a.id) - Number(b.id));
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = columns.map((c) => {
        const value = row[c];
        return value !== null && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value;
      });
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const inserted = await query(
        `insert into ${table} (${columns.map((c) => `"${c.replace(/"/g, '')}"`).join(', ')}) values (${placeholders})
         on conflict do nothing returning 1 as ok`,
        values,
      );
      added[table] += inserted.length;
    }
  }
  // New comments must not reuse a restored id.
  for (const table of ['comments', 'comment_edits', 'comments_removed'] as const) {
    await query(`select setval(pg_get_serial_sequence('${table}', 'id'), greatest((select coalesce(max(id), 0) from ${table}), 1))`);
  }
  return added;
}
