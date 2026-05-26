export type SearchQuestion = {
  id: string;
  question: string;
  options: string[];
};

export const searchQuestions: SearchQuestion[] = [
  {
    id: "sq-date-frequency",
    question: "주말에 얼마나 자주 데이트 했으면 하나요?",
    options: [
      "최대한 같이 있고 싶어요",
      "시간이 되면 만나고 싶어요",
      "각자 쉬는 시간도 소중해요"
    ]
  },
  {
    id: "sq-contact",
    question: "연락은 어떻게 하는 게 편하세요?",
    options: [
      "하루 종일 자주 연락하고 싶어요",
      "아침저녁 안부 정도면 충분해요",
      "바쁠 땐 며칠씩 없어도 괜찮아요"
    ]
  },
  {
    id: "sq-conflict",
    question: "갈등이 생기면 어떻게 푸세요?",
    options: [
      "바로 대화로 해결해요",
      "감정이 가라앉은 후 얘기해요",
      "글로 먼저 정리한 뒤 얘기해요"
    ]
  },
  {
    id: "sq-marriage",
    question: "결혼에 대해 어떻게 생각하세요?",
    options: [
      "언젠가는 꼭 하고 싶어요",
      "좋은 사람 만나면 할 것 같아요",
      "아직은 생각해보지 않았어요"
    ]
  },
  {
    id: "sq-money",
    question: "상대방의 경제관념은 어떤 게 맞나요?",
    options: [
      "미래를 위해 꾸준히 저축하는 편",
      "현재를 즐기되 적당히 저축하는 편",
      "버는 만큼 즐기는 편이어도 괜찮아요"
    ]
  },
  {
    id: "sq-alone-time",
    question: "혼자만의 시간을 얼마나 중요하게 생각하나요?",
    options: [
      "연인과 함께하는 시간이 더 좋아요",
      "각자의 시간도 중요하게 여겨요",
      "혼자 시간이 충분히 있어야 해요"
    ]
  },
  {
    id: "sq-hobby",
    question: "서로의 취미에 얼마나 참여했으면 하나요?",
    options: [
      "함께할 취미를 만들어가고 싶어요",
      "가끔 같이 해보는 정도면 좋아요",
      "각자의 취미는 서로 존중하면 좋겠어요"
    ]
  },
  {
    id: "sq-lifestyle",
    question: "평소 생활 패턴은 어떤 편이 잘 맞나요?",
    options: [
      "일찍 자고 일찍 일어나는 편이에요",
      "특별히 정해진 패턴은 없어요",
      "늦게 자고 늦게 일어나는 편이에요"
    ]
  },
  {
    id: "sq-future",
    question: "연애에서 가장 중요하게 생각하는 건 뭔가요?",
    options: [
      "서로에 대한 신뢰와 솔직함",
      "함께 성장하고 발전하는 것",
      "일상에서 느끼는 편안함과 안정감"
    ]
  },
  {
    id: "sq-pace",
    question: "연애 초반 속도는 어떻게 맞춰가고 싶으세요?",
    options: [
      "빠르게 깊어지는 게 좋아요",
      "천천히 알아가며 자연스럽게요",
      "서로 맞춰가다 보면 될 것 같아요"
    ]
  }
];
