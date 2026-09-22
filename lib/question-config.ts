import type { QuestionDef } from "./scenarios";

export const MAX_CHOICE_OPTIONS = 255;
export const MAX_SCORE_LEVELS = 10;

export function choiceOptions(q: QuestionDef) {
  if (q.choiceOptions) return q.choiceOptions;
  return !Array.isArray(q.criteria) && q.criteria
    ? Object.entries(q.criteria).map(([label, description]) => ({ label, description }))
    : [];
}

export function scoreLevels(q: QuestionDef) {
  return Array.isArray(q.criteria) ? q.criteria : [];
}

export function yesNoCriteria(q: QuestionDef) {
  const criteria = !Array.isArray(q.criteria) && q.criteria ? q.criteria : {};
  return { true: criteria.true ?? "", false: criteria.false ?? "" };
}

export function copyQuestion(q: QuestionDef): QuestionDef {
  return {
    ...q,
    criteria: Array.isArray(q.criteria) ? [...q.criteria] : q.criteria ? { ...q.criteria } : undefined,
    choiceOptions: q.type === "choice" ? choiceOptions(q).map((option) => ({ ...option })) : undefined,
  };
}

export function validateQuestions(questions: QuestionDef[]): string | null {
  if (!questions.length) return "Add at least one question.";
  for (const [index, q] of questions.entries()) {
    const name = `Question ${index + 1}`;
    if (!q.instructions.trim()) return `${name}: enter the question text.`;
    if (q.type === "noul") {
      const criteria = yesNoCriteria(q);
      if (Boolean(criteria.true.trim()) !== Boolean(criteria.false.trim())) {
        return `${name}: define both Yes and No, or leave both blank.`;
      }
    } else if (q.type === "choice") {
      const options = choiceOptions(q);
      if (options.length < 2 || options.length > MAX_CHOICE_OPTIONS) return `${name}: add 2–255 choices.`;
      if (options.some((option) => !option.label.trim() || !option.description.trim())) {
        return `${name}: give every choice a name and a definition.`;
      }
      const labels = options.map((option) => option.label.trim().toLocaleLowerCase());
      if (new Set(labels).size !== labels.length) return `${name}: choice names must be unique.`;
    } else {
      const levels = scoreLevels(q);
      if (levels.length < 2 || levels.length > MAX_SCORE_LEVELS) return `${name}: add 2–10 score levels.`;
      if (levels.some((level) => !level.trim())) return `${name}: describe every score level.`;
    }
  }
  return null;
}

export function buildQuestions(questions: QuestionDef[]) {
  const result: Record<string, { type: QuestionDef["type"]; instructions: string; criteria?: Record<string, string> | string[] }> = {};
  for (const q of questions) {
    let criteria: Record<string, string> | string[] | undefined;
    if (q.type === "noul") {
      const definitions = yesNoCriteria(q);
      if (definitions.true.trim() && definitions.false.trim()) {
        criteria = { true: definitions.true.trim(), false: definitions.false.trim() };
      }
    } else if (q.type === "choice") {
      criteria = Object.fromEntries(choiceOptions(q).map((option) => [option.label.trim(), option.description.trim()]));
    } else {
      criteria = scoreLevels(q).map((level) => level.trim());
    }
    result[q.id] = { type: q.type, instructions: q.instructions.trim(), ...(criteria ? { criteria } : {}) };
  }
  return result;
}
