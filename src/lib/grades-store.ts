import { getDoc } from './doc';
import { parseGradeScheme, type GradeBand } from './grades';

export function getGradeScheme(): GradeBand[] {
  const instructions = getDoc('instructions');
  return instructions ? parseGradeScheme(instructions.body) : [];
}
