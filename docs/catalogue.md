# The paper catalogue

Every paper Europe PMC indexes that names ME/CFS, long COVID or another post-acute infection
syndrome in its title or abstract, one row each, in the site's Postgres database. Not public.

## How it stays up to date

- **Papers.** A daily Vercel cron (`/api/cron/catalogue`, needs `CRON_SECRET`) reads the
  Europe PMC search ten pages at a time. A full pass takes about three days, then a new pass
  starts a week later, picking up new papers and refreshing citations and access. The admin
  Catalogue tab can fetch more by hand.
- **Reviews.** The review files are the record; the site copies them into `catalogue_reviews`
  and matches them to papers by DOI. It does so when a review is published, drafted,
  withdrawn or restored in admin (straight away), whenever the Catalogue tab is opened, and
  with the daily cron. A draft pushed by a session therefore shows in the catalogue once Vercel
  has rebuilt and the tab is opened, or by the next day. Sessions never write to the database.

## Reading it from a Claude Code session

Sessions cannot open an ordinary Postgres connection, so they query Neon over HTTPS, as a role
that can only read the catalogue:

```
npm run -s catalogue-query -- "select title, cited_by from papers order by cited_by desc limit 10"
npm run -s catalogue-query -- --file query.sql --csv > out.csv
```

It needs `CATALOGUE_DATABASE_URL` in the cloud environment. The site itself ignores that
variable.

### Setting up the role (once)

1. Neon console → the project → **Roles** → create a role, e.g. `claude_reader`.
2. Open the admin Catalogue tab once after deploying, so the tables exist. Then in Neon's
   **SQL Editor**:
   ```sql
   grant usage on schema public to claude_reader;
   grant select on papers, catalogue_sync, catalogue_reviews to claude_reader;
   ```
   This role cannot see comments, ratings or anything else, and cannot change anything.
3. Copy the role's connection string (Neon's **Connect** button, pooled), and add it to the
   Claude cloud environment as `CATALOGUE_DATABASE_URL`. New sessions pick it up.

## Tables

`papers`: `id` (Europe PMC source and id, e.g. `MED:36042189`), `doi` (lower case), `pmid`,
`pmcid`, `title`, `authors`, `journal`, `year`, `pub_date`, `abstract`, `pub_types`, `kind`
(`research`, `review`, `commentary`, `preprint`), `conditions` (array of `ME/CFS`,
`Long COVID`, `Other`), `in_title` (the condition is named in the title), `retracted`,
`cited_by` (Europe PMC's count), `access` (`open`, `free`, `paywalled`), `best_url`.

`catalogue_reviews`: `slug` (the review's file name), `doi`, `title`, `kind`, `status`
(`draft`, `published`), `score`, `signal`, `reviewed_on`, `guide_version`.

`catalogue_sync`: how far the current pass has got.

## Example queries

Most-cited research papers with the condition in the title and no review yet:

```sql
select p.title, p.year, p.cited_by, p.access, p.doi
from papers p
where p.kind = 'research' and p.in_title
  and not exists (select 1 from catalogue_reviews r where r.doi = p.doi)
order by p.cited_by desc
limit 20
```

Is this paper already reviewed?

```sql
select r.slug, r.status, r.score from catalogue_reviews r where r.doi = lower('10.1038/s41467-022-32507-6')
```

Open-access ME/CFS research on post-exertional malaise, by citations:

```sql
select title, year, cited_by, best_url
from papers
where kind = 'research' and 'ME/CFS' = any(conditions) and access = 'open'
  and (title ilike '%post-exertional%' or abstract ilike '%post-exertional%')
order by cited_by desc
limit 20
```
