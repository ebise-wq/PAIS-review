import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc } from '@/lib/doc';
import { Markdown } from '@/components/Markdown';
import { extractToc } from '@/lib/toc';
import { TableOfContents } from '@/components/TableOfContents';

/**
 * A literature review of AI peer review, redone from scratch each month. The version and date
 * come from its frontmatter, so a reader can tell which monthly edition they are looking at.
 */
export function generateMetadata(): Metadata {
  const doc = getDoc('literature');
  return {
    title: doc?.title ?? 'Literature review',
    description: 'A literature review of the evidence on AI peer review.',
    alternates: { canonical: '/literature' },
  };
}

export default function LiteraturePage() {
  const doc = getDoc('literature');
  if (!doc) notFound();

  return (
    <article>
      <header className="review-head">
        <h1>{doc.title}</h1>
        <p className="cite">
          {[doc.version && `Version ${doc.version}`, doc.updated && `Updated ${doc.updated}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      <div className="review-body">
        <TableOfContents entries={extractToc(doc.body)} />
        <div className="toc-main">
          <Markdown>{doc.body}</Markdown>
        </div>
      </div>
    </article>
  );
}
