export interface Calculator {
  id: string;
  name: string;
  description: string;
  category: Category;
  path: string;
  keywords: string[];
  isKiller?: boolean;
  relatedIds: string[];
  seo: {
    title: string;
    description: string;
    h1: string;
    faq: { question: string; answer: string }[];
  };
}

export type Category = "finance" | "health" | "convert" | "date" | "life";

export interface CategoryInfo {
  id: Category;
  name: string;
  path: string;
}

export const categories: CategoryInfo[] = [
  { id: "finance", name: "금융", path: "/finance" },
  { id: "health", name: "건강", path: "/health" },
  { id: "convert", name: "변환", path: "/convert" },
  { id: "date", name: "날짜", path: "/date" },
  { id: "life", name: "생활", path: "/life" },
];

export const calculators: Calculator[] = [
  // 킬러 계산기 3종
  {
    id: "loan-calculator",
    name: "주택대출 시뮬레이터",
    description: "원리금균등·원금균등·만기일시 상환 비교",
    category: "finance",
    path: "/finance/loan-calculator",
    keywords: ["대출", "주택대출", "주담대", "이자", "상환", "원리금", "원금균등", "DSR"],
    isKiller: true,
    relatedIds: ["rent-conversion", "capital-gains-tax", "area-converter", "salary-calculator"],
    seo: {
      title: "주택대출 이자 계산기 - 원리금균등 원금균등 비교 | Tooly",
      description: "매매가, 금리, 기간을 입력하면 원리금균등·원금균등·만기일시 상환 방식을 한눈에 비교합니다. 시중 은행 금리 연동.",
      h1: "주택대출 종합 시뮬레이터",
      faq: [
        { question: "원리금균등 상환이란?", answer: "매월 동일한 금액(원금+이자)을 상환하는 방식입니다. 초기에는 이자 비중이 높고 점차 원금 비중이 높아집니다." },
        { question: "원금균등 상환이란?", answer: "매월 동일한 원금을 상환하고 이자는 남은 잔액에 대해 계산됩니다. 초기 상환액이 크지만 총 이자는 적습니다." },
      ],
    },
  },
  {
    id: "salary-calculator",
    name: "연봉 실수령액 분석기",
    description: "4대보험·소득세 공제 후 실수령액 계산",
    category: "finance",
    path: "/finance/salary-calculator",
    keywords: ["연봉", "실수령액", "월급", "4대보험", "소득세", "공제", "세후"],
    isKiller: true,
    relatedIds: ["severance-calculator", "vat-calculator", "loan-calculator", "compound-interest"],
    seo: {
      title: "연봉 실수령액 계산기 - 2026년 4대보험 소득세 계산 | Tooly",
      description: "연봉을 입력하면 국민연금, 건강보험, 고용보험, 소득세를 자동 계산하여 월 실수령액을 알려드립니다.",
      h1: "연봉 실수령액 계산기",
      faq: [
        { question: "연봉 실수령액이란?", answer: "연봉에서 4대보험(국민연금, 건강보험, 장기요양보험, 고용보험)과 소득세, 지방소득세를 공제한 후 실제로 받는 금액입니다." },
        { question: "4대보험 공제율은?", answer: "2026년 기준 국민연금 4.5%, 건강보험 3.545%, 장기요양보험 건강보험의 12.95%, 고용보험 0.9%입니다." },
      ],
    },
  },
  {
    id: "compound-interest",
    name: "투자 복리 계산기",
    description: "적립식·거치식 비교, 인플레이션 반영",
    category: "finance",
    path: "/finance/compound-interest",
    keywords: ["복리", "투자", "적립식", "거치식", "이자", "수익률", "인플레이션"],
    isKiller: true,
    relatedIds: ["deposit-calculator", "currency-converter", "salary-calculator", "loan-calculator"],
    seo: {
      title: "투자 복리 계산기 - 적립식 거치식 비교 | Tooly",
      description: "초기 투자금과 월 적립액, 수익률을 입력하면 복리 효과를 시각적으로 보여줍니다. 인플레이션 반영 실질 수익 확인.",
      h1: "투자 복리 계산기",
      faq: [
        { question: "복리란?", answer: "원금뿐 아니라 이자에도 이자가 붙는 방식입니다. 시간이 지날수록 이자가 기하급수적으로 증가합니다." },
        { question: "적립식과 거치식의 차이는?", answer: "적립식은 매월 일정 금액을 추가 투자하는 방식이고, 거치식은 초기 목돈을 투자한 후 추가 투자 없이 운용하는 방식입니다." },
      ],
    },
  },
  // 일반 계산기 1차 배치 (7종)
  {
    id: "deposit-calculator",
    name: "예적금 이자 계산기",
    description: "세전·세후 이자와 만기수령액 계산",
    category: "finance",
    path: "/finance/deposit-calculator",
    keywords: ["예금", "적금", "이자", "만기", "세후", "세전"],
    relatedIds: ["compound-interest", "salary-calculator", "loan-calculator"],
    seo: {
      title: "예적금 이자 계산기 - 세후 수령액 계산 | Tooly",
      description: "예금·적금 이자를 세전/세후로 계산합니다. 이자과세 유형별 만기 수령액을 확인하세요.",
      h1: "예적금 이자 계산기",
      faq: [
        { question: "이자소득세란?", answer: "금융소득에 부과되는 세금으로, 일반과세 시 15.4%(소득세 14% + 지방소득세 1.4%)가 적용됩니다." },
      ],
    },
  },
  {
    id: "rent-conversion",
    name: "전월세 전환 계산기",
    description: "보증금과 월세 간 상호 변환",
    category: "finance",
    path: "/finance/rent-conversion",
    keywords: ["전세", "월세", "전환율", "보증금", "전월세"],
    relatedIds: ["loan-calculator", "area-converter", "capital-gains-tax"],
    seo: {
      title: "전월세 전환 계산기 - 보증금 월세 변환 | Tooly",
      description: "전세 보증금과 월세를 법정 전환율 기준으로 상호 변환합니다.",
      h1: "전월세 전환 계산기",
      faq: [
        { question: "전월세 전환율이란?", answer: "보증금을 월세로, 또는 월세를 보증금으로 환산할 때 사용하는 비율입니다. 법정 전환율은 한국은행 기준금리에 대통령령으로 정한 이율을 더한 값입니다." },
      ],
    },
  },
  {
    id: "severance-calculator",
    name: "퇴직금 계산기",
    description: "근속기간 기반 퇴직금 산출",
    category: "finance",
    path: "/finance/severance-calculator",
    keywords: ["퇴직금", "퇴직", "근속", "평균임금"],
    relatedIds: ["salary-calculator", "compound-interest", "deposit-calculator"],
    seo: {
      title: "퇴직금 계산기 - 예상 퇴직금 조회 | Tooly",
      description: "입사일, 퇴사일, 월급을 입력하면 예상 퇴직금을 자동으로 계산합니다.",
      h1: "퇴직금 계산기",
      faq: [
        { question: "퇴직금 계산법은?", answer: "퇴직금 = 1일 평균임금 × 30일 × (근속일수 ÷ 365)로 계산됩니다." },
      ],
    },
  },
  {
    id: "capital-gains-tax",
    name: "양도소득세 계산기",
    description: "부동산 양도차익과 세금 계산",
    category: "finance",
    path: "/finance/capital-gains-tax",
    keywords: ["양도소득세", "양도세", "부동산", "매매", "장기보유"],
    relatedIds: ["loan-calculator", "rent-conversion", "area-converter"],
    seo: {
      title: "양도소득세 계산기 - 부동산 양도세 자동 계산 | Tooly",
      description: "취득가액, 양도가액, 보유기간을 입력하면 장기보유 특별공제를 반영한 양도소득세를 계산합니다.",
      h1: "양도소득세 계산기",
      faq: [
        { question: "양도소득세란?", answer: "부동산 등 자산을 팔아 얻은 이익(양도차익)에 부과되는 세금입니다." },
      ],
    },
  },
  {
    id: "vat-calculator",
    name: "부가세 계산기",
    description: "공급가액과 부가세 간 변환",
    category: "finance",
    path: "/finance/vat-calculator",
    keywords: ["부가세", "부가가치세", "VAT", "공급가액", "세금계산서"],
    relatedIds: ["salary-calculator", "capital-gains-tax"],
    seo: {
      title: "부가세 계산기 - VAT 포함/별도 변환 | Tooly",
      description: "공급가액에서 부가세를 계산하거나, 합계금액에서 부가세를 추출합니다.",
      h1: "부가세 계산기",
      faq: [
        { question: "부가가치세란?", answer: "상품이나 서비스의 거래 시 부과되는 간접세로, 한국에서는 일반적으로 10%입니다." },
      ],
    },
  },
  {
    id: "area-converter",
    name: "평수 계산기",
    description: "평(坪)과 제곱미터(m²) 변환",
    category: "convert",
    path: "/convert/area-converter",
    keywords: ["평수", "제곱미터", "평", "m2", "면적", "아파트"],
    relatedIds: ["loan-calculator", "rent-conversion"],
    seo: {
      title: "평수 계산기 - 평 제곱미터(m²) 변환 | Tooly",
      description: "평수를 제곱미터로, 제곱미터를 평수로 간편하게 변환합니다.",
      h1: "평수 계산기",
      faq: [
        { question: "1평은 몇 제곱미터인가요?", answer: "1평은 약 3.3058m²입니다." },
      ],
    },
  },
  {
    id: "currency-converter",
    name: "환율 변환기",
    description: "주요 통화 간 실시간 환율 변환",
    category: "convert",
    path: "/convert/currency-converter",
    keywords: ["환율", "달러", "엔화", "위안", "유로", "원화", "환전"],
    relatedIds: ["compound-interest", "deposit-calculator"],
    seo: {
      title: "환율 계산기 - 실시간 환율 변환 | Tooly",
      description: "원화와 주요 외화 간 환율을 실시간으로 변환합니다.",
      h1: "환율 변환기",
      faq: [
        { question: "환율은 어디서 가져오나요?", answer: "한국수출입은행 환율 정보를 기반으로 매일 업데이트됩니다." },
      ],
    },
  },
];

export function getCalculator(id: string): Calculator | undefined {
  return calculators.find((c) => c.id === id);
}

export function getCalculatorsByCategory(category: Category): Calculator[] {
  return calculators.filter((c) => c.category === category);
}

export function getKillerCalculators(): Calculator[] {
  return calculators.filter((c) => c.isKiller);
}

export function getRelatedCalculators(id: string): Calculator[] {
  const calc = getCalculator(id);
  if (!calc) return [];
  return calc.relatedIds
    .map((rid) => getCalculator(rid))
    .filter((c): c is Calculator => c !== undefined);
}

export function searchCalculators(query: string): Calculator[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return calculators.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  );
}
