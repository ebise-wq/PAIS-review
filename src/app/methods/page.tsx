import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoc, getSkill, renderTemplate } from '@/lib/doc';
import { site } from '@/lib/site';
import { Markdown } from '@/components/Markdown';
import { splitChangelog } from '@/lib/changes';
import { GradeScheme } from '@/components/GradeScheme';
import { getGradeScheme } from '@/lib/grades-store';
import { Comments } from '@/components/Comments';
import { getSiteText } from '@/lib/site-text';
import { dbConfigured } from '@/lib/db';
import { extractToc, type TocEntry } from '@/lib/toc';
import { TableOfContents } from '@/components/TableOfContents';

/**
 * The guide's changelog is long and only some readers want it, so it is split off and
 * shown folded. Everything from its "## Changelog" heading onward goes in the fold.
 */
export function generateMetadata(): Metadata {
  return { title: 'Methods', description: getSiteText()['methods.description'], alternates: { canonical: '/methods' } };
}

export default function MethodsPage() {
  const methods = getDoc('methods');
  const guide = getDoc('guide');
  if (!methods || !guide) notFound();
  const text = getSiteText();
  const methodsBody = renderTemplate(methods.body, site.url);
  const { main: guideBody, changelog } = splitChangelog(guide.body);
  const hasComments = dbConfigured();
  const grades = getGradeScheme();
  const skill = getSkill();
  const instructions = getDoc('instructions');

  // The same contents list as a review page, built from everything on this page in order.
  const toc: TocEntry[] = [
    ...extractToc(methodsBody),
    ...(instructions ? [{ id: 'instructions', text: text['methods.instructionsSummary'] }] : []),
    ...(skill ? [{ id: 'review-skill', text: text['methods.skillSummary'] }] : []),
    ...(grades.length ? [{ id: 'grade-scheme', text: text['methods.gradesSummary'] }] : []),
    ...extractToc(guideBody),
    ...(changelog ? [{ id: 'changelog', text: 'Changelog' }] : []),
    ...(hasComments ? [{ id: 'comments', text: 'Comments' }] : []),
  ];

  return (
    <article>
      <header className="review-head">
        <h1>{methods.title}</h1>
        <p className="cite">
          {[guide.version && `Version ${guide.version}`, guide.updated && `Updated ${guide.updated}`]
            .filter(Boolean)
            .join(' · ')}
          {hasComments && (
            <>
              {' · '}
              <a href="#comments">Go to comments</a>
            </>
          )}
        </p>
      </header>

      <div className="review-body">
        <TableOfContents entries={toc} />
        <div className="toc-main">
      <Markdown>{methodsBody}</Markdown>

      {/* Everything Claude is told, in full: the instructions every review follows, and the
          extra steps for writing one straight into the site in Claude Code. */}

      {instructions && (
        <details className="prompt-details doc-fold" id="instructions">
          <summary>{text['methods.instructionsSummary']}</summary>
          <Markdown idPrefix="instructions-">{renderTemplate(instructions.body, site.url)}</Markdown>
          <p className="hint">
            As a file: <a href="/instructions.md">/instructions.md</a>
          </p>
        </details>
      )}

      {skill && (
        <details className="prompt-details doc-fold" id="review-skill">
          <summary>{text['methods.skillSummary']}</summary>
          <Markdown idPrefix="skill-">{skill.body}</Markdown>
          <p className="hint">
            As a file: <a href="/review-skill.md">/review-skill.md</a>
          </p>
        </details>
      )}


      {grades.length > 0 && (
        <details className="prompt-details" id="grade-scheme">
          <summary>{text['methods.gradesSummary']}</summary>
          <GradeScheme bands={grades} />
        </details>
      )}

      <section className="guide-section" id="guide">
        <h2 className="guide-title">{guide.title}</h2>
        <Markdown>{guideBody}</Markdown>
        {changelog && (
          <details className="prompt-details changelog-details" id="changelog">
            <summary>Changelog</summary>
            <Markdown>{changelog}</Markdown>
          </details>
        )}
      </section>
        </div>
      </div>

      <Comments type="guide" slug="guide" />
    </article>
  );
}
