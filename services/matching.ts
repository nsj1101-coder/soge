import { ValueAnswer } from "@/types/domain";
import { valueQuestions } from "@/data/valueQuestions";

const toAnswerMap = (answers: ValueAnswer[]): Map<string, string> =>
  new Map(answers.map((answer) => [answer.questionId, answer.option]));

export const calculateMatchRate = (
  myAnswers: ValueAnswer[],
  candidateAnswers: ValueAnswer[]
): number => {
  const myAnswerMap = toAnswerMap(myAnswers);
  const candidateAnswerMap = toAnswerMap(candidateAnswers);

  const score = valueQuestions.reduce(
    (result, question) => {
      const myAnswer = myAnswerMap.get(question.id);
      const candidateAnswer = candidateAnswerMap.get(question.id);
      const matched = myAnswer !== undefined && myAnswer === candidateAnswer;

      return {
        earned: result.earned + (matched ? question.weight : 0),
        total: result.total + question.weight
      };
    },
    { earned: 0, total: 0 }
  );

  if (score.total === 0) {
    return 0;
  }

  return Math.round((score.earned / score.total) * 100);
};

export const formatRemainingTime = (nextAvailableAt: string): string => {
  const remainingMs = new Date(nextAvailableAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return "지금 가능";
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};
