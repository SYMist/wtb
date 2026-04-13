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
  // Phase 1.5 — 건강 카테고리
  {
    id: "bmi-calculator",
    name: "BMI 계산기",
    description: "키와 체중으로 체질량지수(BMI) 계산",
    category: "health",
    path: "/health/bmi-calculator",
    keywords: ["BMI", "체질량지수", "비만", "체중", "키", "비만도"],
    relatedIds: ["bmr-calculator", "calorie-calculator"],
    seo: {
      title: "BMI 계산기 - 체질량지수 비만도 측정 | Tooly",
      description: "키와 체중을 입력하면 BMI(체질량지수)를 계산하고 비만도를 판정합니다.",
      h1: "BMI 계산기",
      faq: [
        { question: "BMI란 무엇인가요?", answer: "BMI(Body Mass Index)는 체중(kg)을 키(m)의 제곱으로 나눈 값으로, 비만도를 간접적으로 측정하는 지표입니다." },
        { question: "정상 BMI 범위는?", answer: "대한비만학회 기준 18.5~22.9가 정상, 23~24.9가 과체중, 25 이상이 비만입니다." },
      ],
    },
  },
  {
    id: "bmr-calculator",
    name: "기초대사량 계산기",
    description: "성별·키·체중·나이로 기초대사량(BMR) 계산",
    category: "health",
    path: "/health/bmr-calculator",
    keywords: ["기초대사량", "BMR", "대사량", "칼로리", "다이어트"],
    relatedIds: ["bmi-calculator", "calorie-calculator"],
    seo: {
      title: "기초대사량 계산기 - BMR 자동 계산 | Tooly",
      description: "성별, 키, 체중, 나이를 입력하면 하루 기초대사량(BMR)을 계산합니다.",
      h1: "기초대사량 계산기",
      faq: [
        { question: "기초대사량이란?", answer: "생명 유지에 필요한 최소한의 에너지량으로, 아무 활동을 하지 않아도 소모되는 칼로리입니다." },
      ],
    },
  },
  {
    id: "calorie-calculator",
    name: "칼로리 계산기",
    description: "활동량 기반 일일 권장 칼로리 계산",
    category: "health",
    path: "/health/calorie-calculator",
    keywords: ["칼로리", "일일칼로리", "다이어트", "식단", "권장칼로리"],
    relatedIds: ["bmr-calculator", "bmi-calculator"],
    seo: {
      title: "칼로리 계산기 - 일일 권장 칼로리 계산 | Tooly",
      description: "기초대사량과 활동 수준에 따라 하루 권장 칼로리를 계산합니다.",
      h1: "일일 칼로리 계산기",
      faq: [
        { question: "일일 권장 칼로리는 어떻게 계산하나요?", answer: "기초대사량(BMR)에 활동계수를 곱하여 산출합니다. 활동이 많을수록 더 많은 칼로리가 필요합니다." },
      ],
    },
  },
  // Phase 1.5 — 날짜 카테고리
  {
    id: "dday-calculator",
    name: "D-Day 계산기",
    description: "특정 날짜까지 남은 일수 계산",
    category: "date",
    path: "/date/dday-calculator",
    keywords: ["디데이", "D-Day", "남은날", "카운트다운"],
    relatedIds: ["date-difference", "age-calculator", "workday-calculator"],
    seo: {
      title: "D-Day 계산기 - 남은 일수 계산 | Tooly",
      description: "목표 날짜까지 남은 일수를 계산합니다. 시험, 기념일, 출산 예정일 등.",
      h1: "D-Day 계산기",
      faq: [
        { question: "D-Day는 어떻게 계산하나요?", answer: "목표 날짜에서 오늘 날짜를 빼서 남은 일수를 계산합니다. D-100은 목표일 100일 전을 의미합니다." },
      ],
    },
  },
  {
    id: "date-difference",
    name: "날짜 차이 계산기",
    description: "두 날짜 사이의 일수·주·월 계산",
    category: "date",
    path: "/date/date-difference",
    keywords: ["날짜차이", "날짜계산", "일수", "기간"],
    relatedIds: ["dday-calculator", "workday-calculator", "age-calculator"],
    seo: {
      title: "날짜 차이 계산기 - 두 날짜 사이 기간 | Tooly",
      description: "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다.",
      h1: "날짜 차이 계산기",
      faq: [
        { question: "윤년은 반영되나요?", answer: "네, 윤년(2월 29일)을 포함하여 정확한 일수를 계산합니다." },
      ],
    },
  },
  {
    id: "age-calculator",
    name: "만 나이 계산기",
    description: "생년월일로 만 나이 계산",
    category: "date",
    path: "/date/age-calculator",
    keywords: ["만나이", "나이계산", "생년월일", "한국나이"],
    relatedIds: ["dday-calculator", "date-difference"],
    seo: {
      title: "만 나이 계산기 - 생년월일 나이 계산 | Tooly",
      description: "생년월일을 입력하면 만 나이와 다음 생일까지 남은 일수를 계산합니다.",
      h1: "만 나이 계산기",
      faq: [
        { question: "만 나이란?", answer: "태어난 날을 0세로 시작하여 생일이 지날 때마다 1세씩 증가하는 국제 표준 나이 계산법입니다. 2023년부터 한국도 만 나이를 공식 사용합니다." },
      ],
    },
  },
  {
    id: "workday-calculator",
    name: "근무일수 계산기",
    description: "공휴일 제외 영업일 계산",
    category: "date",
    path: "/date/workday-calculator",
    keywords: ["근무일수", "영업일", "공휴일", "연차", "출근일"],
    relatedIds: ["date-difference", "dday-calculator", "severance-calculator"],
    seo: {
      title: "근무일수 계산기 - 영업일 계산 (공휴일 제외) | Tooly",
      description: "두 날짜 사이의 근무일수를 공휴일과 주말을 제외하여 계산합니다.",
      h1: "근무일수 계산기",
      faq: [
        { question: "어떤 공휴일이 반영되나요?", answer: "2026년 대한민국 법정 공휴일(대체공휴일 포함)과 주말(토·일)이 제외됩니다." },
      ],
    },
  },
  // Phase 1.5 — 생활 카테고리
  {
    id: "gpa-calculator",
    name: "학점 계산기",
    description: "과목별 성적으로 평균 학점 계산",
    category: "life",
    path: "/life/gpa-calculator",
    keywords: ["학점", "평점", "GPA", "성적", "대학교"],
    relatedIds: ["percent-calculator"],
    seo: {
      title: "학점 계산기 - 평균 학점(GPA) 계산 | Tooly",
      description: "과목별 학점과 성적을 입력하면 평균 학점을 자동으로 계산합니다. 4.3/4.5 만점 지원.",
      h1: "학점 계산기",
      faq: [
        { question: "4.3 만점과 4.5 만점의 차이는?", answer: "4.5 만점 체계는 A+를 4.5로, 4.3 만점 체계는 A+를 4.3으로 계산합니다. 학교마다 다르니 본인의 학교 기준을 확인하세요." },
      ],
    },
  },
  {
    id: "electricity-calculator",
    name: "전기요금 계산기",
    description: "사용량 기반 누진세 전기요금 계산",
    category: "life",
    path: "/life/electricity-calculator",
    keywords: ["전기요금", "전기세", "누진세", "한전", "전력"],
    relatedIds: ["percent-calculator"],
    seo: {
      title: "전기요금 계산기 - 누진세 자동 계산 | Tooly",
      description: "월 사용량을 입력하면 한전 누진세를 적용한 전기요금을 계산합니다.",
      h1: "전기요금 계산기",
      faq: [
        { question: "전기요금 누진세란?", answer: "전기 사용량이 많을수록 단가가 높아지는 단계별 요금제입니다. 주거용은 구간별로 다른 단가가 적용됩니다." },
      ],
    },
  },
  {
    id: "percent-calculator",
    name: "퍼센트 계산기",
    description: "퍼센트 값·비율·변화율 계산",
    category: "life",
    path: "/life/percent-calculator",
    keywords: ["퍼센트", "백분율", "%", "비율", "변화율", "할인율"],
    relatedIds: ["vat-calculator", "gpa-calculator"],
    seo: {
      title: "퍼센트 계산기 - 비율 변화율 계산 | Tooly",
      description: "퍼센트 값, 비율, 변화율을 간편하게 계산합니다.",
      h1: "퍼센트 계산기",
      faq: [
        { question: "퍼센트는 어떻게 계산하나요?", answer: "퍼센트(%)는 전체를 100으로 놓았을 때의 비율입니다. A의 B% = A × B ÷ 100으로 계산합니다." },
      ],
    },
  },
  {
    id: "speed-converter",
    name: "속도 단위 변환기",
    description: "km/h, m/s, mph 간 변환",
    category: "life",
    path: "/life/speed-converter",
    keywords: ["속도", "km/h", "m/s", "mph", "단위변환"],
    relatedIds: ["area-converter", "currency-converter"],
    seo: {
      title: "속도 단위 변환기 - km/h m/s mph 변환 | Tooly",
      description: "km/h, m/s, mph 속도 단위를 간편하게 상호 변환합니다.",
      h1: "속도 단위 변환기",
      faq: [
        { question: "km/h를 m/s로 어떻게 변환하나요?", answer: "km/h 값을 3.6으로 나누면 m/s가 됩니다. 예: 100km/h ÷ 3.6 ≈ 27.78m/s" },
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
