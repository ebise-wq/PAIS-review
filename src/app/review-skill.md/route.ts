import { getSkill } from '@/lib/doc';

export const dynamic = 'force-static';

/** The Claude Code review skill, exactly as the repository has it. */
export function GET() {
  const skill = getSkill();
  if (!skill) return new Response('Not found', { status: 404 });
  return new Response(skill.source, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
