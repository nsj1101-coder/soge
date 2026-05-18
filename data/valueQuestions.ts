import { ValueQuestion } from "@/types/domain";

export const valueQuestions: ValueQuestion[] = [
  {
    id: "relationship-priority",
    title: "연애에서 중요한 것",
    subtitle: "정확한 매칭을 위해 솔직하게 답변해주세요.",
    options: ["신뢰", "대화", "가치관", "설렘", "성장"],
    weight: 2
  },
  {
    id: "marriage",
    title: "결혼에 대한 생각",
    subtitle: "관계의 방향성을 확인해요.",
    options: ["언젠가는 하고 싶어요", "당장은 아니에요", "잘 모르겠어요"],
    weight: 2
  },
  {
    id: "contact",
    title: "연락 빈도",
    subtitle: "서로 편한 리듬이 중요해요.",
    options: ["하루 1~2번", "항상 가능", "적당히", "자유롭게"],
    weight: 1
  },
  {
    id: "weekend",
    title: "주말을 보내는 방식",
    subtitle: "평소 에너지 방향을 알려주세요.",
    options: ["집에서 휴식", "취미 활동", "나들이", "모임/약속"],
    weight: 1
  },
  {
    id: "conflict",
    title: "갈등 해결 방식",
    subtitle: "다툼보다 회복 방식이 중요해요.",
    options: ["바로 대화", "시간을 둠", "글로 정리", "상대에 맞춤"],
    weight: 2
  },
  {
    id: "lifestyle",
    title: "술/흡연에 대한 생각",
    subtitle: "일상 습관의 기준을 맞춰봐요.",
    options: ["상관없음", "가끔만", "비흡연 선호", "절제 중요"],
    weight: 1
  },
  {
    id: "money",
    title: "경제관념",
    subtitle: "소비와 저축의 균형을 확인해요.",
    options: ["계획적", "경험 중시", "저축 중시", "상황에 따라"],
    weight: 1
  },
  {
    id: "pace",
    title: "관계 속도",
    subtitle: "서로 알아가는 속도를 선택해주세요.",
    options: ["천천히", "자연스럽게", "확신이 오면 빠르게", "대화를 많이"],
    weight: 2
  }
];
