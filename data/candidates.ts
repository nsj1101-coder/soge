import { Candidate } from "@/types/domain";

export const candidates: Candidate[] = [
  {
    id: "sora",
    initial: "S",
    ageRange: "27 ~ 32세",
    region: "서울",
    job: "회사원 · 마케팅",
    tags: ["책읽기", "여행", "요리", "필라테스"],
    values: [
      { questionId: "relationship-priority", option: "신뢰" },
      { questionId: "marriage", option: "언젠가는 하고 싶어요" },
      { questionId: "contact", option: "적당히" },
      { questionId: "weekend", option: "취미 활동" },
      { questionId: "conflict", option: "바로 대화" },
      { questionId: "lifestyle", option: "절제 중요" },
      { questionId: "money", option: "계획적" },
      { questionId: "pace", option: "천천히" }
    ],
    summary: ["차분함", "성실", "대화 중시", "결혼은 천천히", "가족 중심", "서로 존중"]
  },
  {
    id: "jiyu",
    initial: "J",
    ageRange: "30 ~ 35세",
    region: "경기",
    job: "디자이너",
    tags: ["전시", "산책", "커피", "음악"],
    values: [
      { questionId: "relationship-priority", option: "대화" },
      { questionId: "marriage", option: "당장은 아니에요" },
      { questionId: "contact", option: "자유롭게" },
      { questionId: "weekend", option: "나들이" },
      { questionId: "conflict", option: "시간을 둠" },
      { questionId: "lifestyle", option: "가끔만" },
      { questionId: "money", option: "상황에 따라" },
      { questionId: "pace", option: "자연스럽게" }
    ],
    summary: ["감성적", "취향 뚜렷", "자유로움", "산책 선호", "대화형", "배려 깊음"]
  },
  {
    id: "min",
    initial: "M",
    ageRange: "28 ~ 33세",
    region: "인천",
    job: "개발자",
    tags: ["러닝", "독서", "영화", "맛집"],
    values: [
      { questionId: "relationship-priority", option: "가치관" },
      { questionId: "marriage", option: "언젠가는 하고 싶어요" },
      { questionId: "contact", option: "하루 1~2번" },
      { questionId: "weekend", option: "집에서 휴식" },
      { questionId: "conflict", option: "글로 정리" },
      { questionId: "lifestyle", option: "비흡연 선호" },
      { questionId: "money", option: "저축 중시" },
      { questionId: "pace", option: "대화를 많이" }
    ],
    summary: ["안정적", "계획형", "진지함", "비흡연", "저축 중시", "차분함"]
  }
];
