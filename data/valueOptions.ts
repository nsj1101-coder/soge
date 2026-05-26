import { searchQuestions } from "./searchQuestions";

export type ValueGroup = {
  title: string;
  options: string[];
};

export const VALUE_GROUPS: ValueGroup[] = searchQuestions.map((q) => ({
  title: q.question,
  options: q.options
}));

export const ALL_VALUE_OPTIONS: string[] = VALUE_GROUPS.flatMap((g) => g.options);

export const OPTION_TO_QUESTION: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const q of searchQuestions) {
    for (const opt of q.options) map[opt] = q.id;
  }
  return map;
})();
