import { Pool, type QueryResultRow } from 'pg';

/**
 * One Postgres pool per server instance. Vercel's storage integrations set the connection
 * URL under a name that depends on the prefix chosen when the store was connected
 * (DATABASE_URL, STORAGE_URL, STORAGE_POSTGRES_URL, ...), so rather than guess the name,
 * take any variable whose value is a Postgres URL. Pooled URLs are preferred over the
 * unpooled / Prisma variants the same integration also sets. Without any, comments and
 * ratings simply do not appear — the rest of the site does not depend on this.
 */
const PREFERRED_NAMES = ['DATABASE_URL', 'POSTGRES_URL'];

function looksLikePostgres(value: string | undefined): value is string {
  return Boolean(value && /^postgres(ql)?:\/\//i.test(value));
}

/** Names (never values) of every environment variable holding a Postgres URL. */
export function postgresEnvNames(): string[] {
  return Object.keys(process.env)
    .filter((name) => looksLikePostgres(process.env[name]))
    .sort();
}

function connectionString(): string | undefined {
  for (const name of PREFERRED_NAMES) {
    if (looksLikePostgres(process.env[name])) return process.env[name];
  }
  const secondBest = (name: string) => (/UNPOOLED|NON_POOLING|NO_SSL|PRISMA/i.test(name) ? 1 : 0);
  const [best] = postgresEnvNames().sort((a, b) => secondBest(a) - secondBest(b) || a.localeCompare(b));
  return best ? process.env[best] : undefined;
}

export function dbConfigured(): boolean {
  return Boolean(connectionString());
}

let pool: Pool | undefined;

function getPool(): Pool {
  const url = connectionString();
  if (!url) throw new Error('No database URL is set.');
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 3,
      // Neon and most hosted Postgres need TLS; a local server does not offer it.
      ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

const SCHEMA = `
create table if not exists comments (
  id             bigserial primary key,
  target_type    text not null,
  target_slug    text not null,
  target_version text,
  parent_id      bigint references comments(id) on delete cascade,
  username       text not null,
  body           text not null,
  voter          text not null,
  ip             text,
  hidden         boolean not null default false,
  created_at     timestamptz not null default now()
);
create index if not exists comments_target_idx on comments (target_type, target_slug, created_at);
create index if not exists comments_voter_recent_idx on comments (voter, created_at);

create table if not exists comment_votes (
  comment_id bigint not null references comments(id) on delete cascade,
  voter      text not null,
  axis       text not null check (axis in ('karma', 'agree', 'heart')),
  value      smallint not null check (value in (-1, 1)),
  primary key (comment_id, voter, axis)
);

-- Databases created before hearts existed have the older two-axis check. Replace it once;
-- on every later start the condition is false and nothing is touched.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'comment_votes_axis_check' and pg_get_constraintdef(oid) like '%heart%'
  ) then
    alter table comment_votes drop constraint if exists comment_votes_axis_check;
    alter table comment_votes add constraint comment_votes_axis_check check (axis in ('karma', 'agree', 'heart'));
  end if;
end $$;

-- Added later: edits, retractions and resolution. Each runs once; later starts skip it.
alter table comments add column if not exists edited_at timestamptz;
alter table comments add column if not exists retracted_at timestamptz;
alter table comments add column if not exists resolved_at timestamptz;

-- Every earlier text of an edited comment, so an edit cannot quietly rewrite history.
create table if not exists comment_edits (
  id         bigserial primary key,
  comment_id bigint not null references comments(id) on delete cascade,
  body       text not null,
  edited_at  timestamptz not null default now()
);

create table if not exists ratings (
  review_slug text not null,
  voter       text not null,
  stars       smallint not null check (stars between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (review_slug, voter)
);
`;

let schemaReady: Promise<void> | undefined;

/** Creates the tables on first use. Idempotent, and memoised per server instance. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((error) => {
        schemaReady = undefined;
        throw error;
      });
  }
  return schemaReady;
}

/**
 * A plain-English reason for a failed connection, safe to show publicly: never the
 * host, user or password, only what kind of thing went wrong. The codes are the ones
 * `pg` and Node put on the error.
 */
export function describeDbError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  switch (code) {
    case 'ENOTFOUND':
    case 'EAI_AGAIN':
      return 'The database host name could not be resolved. Check DATABASE_URL.';
    case 'ECONNREFUSED':
    case 'ETIMEDOUT':
    case 'ECONNRESET':
      return 'The database did not answer. It may be paused, or the URL points somewhere wrong.';
    case '28P01':
    case '28000':
      return 'The database rejected the username or password in DATABASE_URL.';
    case '3D000':
      return 'The database named in DATABASE_URL does not exist.';
    case '42501':
      return 'The database user is not allowed to create tables.';
    default:
      return code ? `Database error ${code}.` : 'Could not reach the database.';
  }
}

/** Runs one trivial query so a status page can say whether the database answers. */
export async function pingDb(): Promise<void> {
  await query('select 1');
}

/** Closes the pool, so a test run or script can exit. The site never calls this. */
export async function closeDb(): Promise<void> {
  const open = pool;
  pool = undefined;
  schemaReady = undefined;
  await open?.end();
}
