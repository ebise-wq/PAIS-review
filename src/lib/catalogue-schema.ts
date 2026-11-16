/** The catalogue's tables, created with the rest of the schema in db.ts. Kept apart from catalogue.ts so db.ts does not import it. */
export const CATALOGUE_SCHEMA = `
create table if not exists papers (
  id          text primary key,
  doi         text,
  pmid        text,
  pmcid       text,
  title       text not null,
  authors     text,
  journal     text,
  year        int,
  pub_date    date,
  abstract    text,
  pub_types   text[] not null default '{}',
  kind        text not null,
  conditions  text[] not null default '{}',
  in_title    boolean not null default false,
  retracted   boolean not null default false,
  cited_by    int not null default 0,
  access      text not null,
  best_url    text,
  first_seen  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists papers_doi_idx on papers (doi);
create index if not exists papers_cited_idx on papers (cited_by desc);
create index if not exists papers_conditions_idx on papers using gin (conditions);

create table if not exists catalogue_sync (
  id            int primary key check (id = 1),
  cursor        text,
  pass_started  timestamptz,
  pass_done     timestamptz,
  seen_in_pass  int not null default 0,
  hit_count     int,
  last_run      timestamptz,
  last_error    text
);
insert into catalogue_sync (id) values (1) on conflict do nothing;

-- The site's own reviews, one row each, copied from the review files so the catalogue can
-- say which papers are reviewed. Matched to papers by DOI. pinned_until protects a status
-- just set by publishing or withdrawing from being overwritten by the deployed files, which
-- lag behind until Vercel has rebuilt.
create table if not exists catalogue_reviews (
  slug           text primary key,
  doi            text,
  title          text not null,
  kind           text not null,
  status         text not null check (status in ('draft', 'published')),
  score          numeric,
  signal         text,
  reviewed_on    date,
  guide_version  text,
  pinned_until   timestamptz,
  updated_at     timestamptz not null default now()
);
create index if not exists catalogue_reviews_doi_idx on catalogue_reviews (doi);
`;
