import type { ReactNode } from 'react';
import type { Element, ElementContent } from 'hast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { headingId } from '@/lib/toc';

/**
 * A paragraph whose whole content is one bold run is being used as a sub-heading —
 * "**Sample counts do not add up.**" on its own line, followed by a list. Reviews are
 * written that way, but markdown renders it as ordinary bold, so the third level of
 * structure disappears and everything below H2 reads flat.
 *
 * A run-in label like "**Cases.** The inclusion criteria are…" is a sentence, not a
 * heading, so it stays a paragraph.
 */
function isStandaloneBold(node: Element | undefined): boolean {
  const children = (node?.children ?? []).filter(
    (child: ElementContent) => !(child.type === 'text' && child.value.trim() === ''),
  );
  return (
    children.length === 1 && children[0].type === 'element' && children[0].tagName === 'strong'
  );
}

/** Plain text of a heading node, for building an anchor id that matches the contents list. */
function textOf(node: Element | undefined): string {
  const walk = (children: ElementContent[]): string =>
    children
      .map((child) => {
        if (child.type === 'text') return child.value;
        if (child.type === 'element') return walk(child.children);
        return '';
      })
      .join('');
  return walk(node?.children ?? []).trim();
}

/**
 * Reviews are trusted content, but raw HTML stays disabled anyway — react-markdown
 * ignores it unless rehype-raw is added, and it should not be.
 */
export function Markdown({ children, idPrefix = '' }: { children: string; /** Keeps heading anchors apart when two documents share a page. */ idPrefix?: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: inner }) => (
            <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              {inner}
            </a>
          ),
          p: ({ node, children: inner }: { node?: Element; children?: ReactNode }) =>
            isStandaloneBold(node) ? <h3 className="run-in">{inner}</h3> : <p>{inner}</p>,
          h2: ({ node, children: inner }: { node?: Element; children?: ReactNode }) => (
            <h2 id={idPrefix + headingId(textOf(node))}>{inner}</h2>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
