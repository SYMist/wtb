export interface Calculator {
  id: string;
  name: string;
  description: string;
  icon: string;
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
  description: string;
}

export const categories: CategoryInfo[] = [
  { id: "finance", name: "금융", path: "/finance", description: "주택대출, 연봉 실수령액, 복리, 예적금, 전월세, 퇴직금, 양도세, 부가세 등 재테크와 세금 관련 계산기" },
  { id: "health", name: "건강", path: "/health", description: "BMI 체질량지수, 기초대사량, 일일 칼로리 등 건강 관리에 필요한 계산기" },
  { id: "convert", name: "변환", path: "/convert", description: "평수·제곱미터 면적 변환, 원화·외화 환율 변환 등 단위 변환 도구" },
  { id: "date", name: "날짜", path: "/date", description: "D-Day 카운트다운, 날짜 차이, 만 나이, 근무일수 등 날짜 관련 계산기" },
  { id: "life", name: "생활", path: "/life", description: "학점 계산, 전기요금, 퍼센트, 속도 변환 등 일상생활에서 자주 쓰는 계산기" },
];

export const calculators: Calculator[] = [
  // 킬러 계산기 3종
  {
    id: "loan-calculator",
    name: "주택대출 시뮬레이터",
    description: "금리·기간별 월 상환금과 총이자 한눈에 비교",
    icon: "🏠",
    category: "finance",
    path: "/finance/loan-calculator",
    keywords: ["대출", "주택대출", "주담대", "이자", "상환", "원리금", "원금균등", "DSR", "월상환금", "대출이자계산"],
    isKiller: true,
    relatedIds: ["rent-conversion", "capital-gains-tax", "area-converter", "salary-calculator"],
    seo: {
      title: "주택대출 이자 계산기 - 원리금균등 원금균등 비교 | Tooly",
      description: "주담대 금리·대출금액·상환기간을 입력하면 원리금균등·원금균등·만기일시 방식의 월 상환금과 총이자를 비교합니다. 2억·3억·5억·10억 대출 이자 자동 계산.",
      h1: "주택대출 종합 시뮬레이터",
      faq: [
        { question: "원리금균등 상환이란?", answer: "매월 동일한 금액(원금+이자)을 상환하는 방식입니다. 초기에는 이자 비중이 높고 점차 원금 비중이 높아집니다." },
        { question: "원금균등 상환이란?", answer: "매월 동일한 원금을 상환하고 이자는 남은 잔액에 대해 계산됩니다. 초기 상환액이 크지만 총 이자는 적습니다." },
        { question: "거치기간이란?", answer: "대출 후 일정 기간 이자만 납부하고 원금 상환을 유예하는 기간입니다. 보통 1~3년으로 설정합니다." },
        { question: "DSR이란?", answer: "총부채원리금상환비율로, 연 소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. 2026년 기준 40% 규제가 적용됩니다." },
        { question: "고정금리와 변동금리 차이는?", answer: "고정금리는 대출 기간 동안 금리가 변하지 않고, 변동금리는 기준금리에 따라 주기적으로 조정됩니다." },
      ],
    },
  },
  {
    id: "salary-calculator",
    name: "연봉 실수령액 분석기",
    description: "연봉별 월 실수령액, 4대보험·소득세 공제 내역 자동 계산",
    icon: "💰",
    category: "finance",
    path: "/finance/salary-calculator",
    keywords: ["연봉", "실수령액", "월급", "4대보험", "소득세", "공제", "세후", "연봉계산기", "월급계산기", "세후연봉"],
    isKiller: true,
    relatedIds: ["severance-calculator", "vat-calculator", "loan-calculator", "compound-interest"],
    seo: {
      title: "연봉 실수령액 계산기 - 2026년 4대보험 소득세 계산 | Tooly",
      description: "연봉 3000만원·5000만원·1억원별 월 실수령액을 2026년 최신 4대보험 요율(국민연금 4.5%, 건강보험 3.545%)과 소득세로 정확하게 계산합니다. 비과세 수당, 부양가족 수별 공제 차이 반영.",
      h1: "연봉 실수령액 계산기",
      faq: [
        { question: "연봉 실수령액이란?", answer: "연봉에서 4대보험(국민연금, 건강보험, 장기요양보험, 고용보험)과 소득세, 지방소득세를 공제한 후 실제로 받는 금액입니다." },
        { question: "4대보험 공제율은?", answer: "2026년 기준 국민연금 4.5%, 건강보험 3.545%, 장기요양보험 건강보험의 12.95%, 고용보험 0.9%입니다." },
        { question: "비과세 항목이란?", answer: "식대(월 20만원), 자가운전보조금, 출산·보육수당 등 소득세가 면제되는 급여 항목입니다." },
        { question: "부양가족 공제란?", answer: "연간 소득 100만원 이하 가족 1인당 월 소득세를 경감해주는 제도입니다." },
        { question: "연봉과 월급의 차이는?", answer: "연봉은 세전 연간 총급여이고, 월급은 연봉을 12로 나눈 세전 월 급여입니다. 실수령액은 공제액을 뺀 금액입니다." },
      ],
    },
  },
  {
    id: "compound-interest",
    name: "투자 복리 계산기",
    description: "매달 얼마 넣으면 얼마? 기간·수익률별 복리 수익 계산",
    icon: "📈",
    category: "finance",
    path: "/finance/compound-interest",
    keywords: ["복리", "투자", "적립식", "거치식", "이자", "수익률", "인플레이션", "복리계산기", "적금복리", "72의법칙"],
    isKiller: true,
    relatedIds: ["deposit-calculator", "currency-converter", "salary-calculator", "loan-calculator"],
    seo: {
      title: "투자 복리 계산기 - 적립식 거치식 비교 | Tooly",
      description: "월 50만원씩 10년·20년·30년 복리 투자하면 얼마? 초기 투자금과 월 적립액, 수익률을 입력하면 복리 효과를 시각적으로 보여줍니다. 72의 법칙, 인플레이션 반영 실질 수익 확인.",
      h1: "투자 복리 계산기",
      faq: [
        { question: "복리란?", answer: "원금뿐 아니라 이자에도 이자가 붙는 방식입니다. 시간이 지날수록 이자가 기하급수적으로 증가합니다." },
        { question: "적립식과 거치식의 차이는?", answer: "적립식은 매월 일정 금액을 추가 투자하는 방식이고, 거치식은 초기 목돈을 투자한 후 추가 투자 없이 운용하는 방식입니다." },
        { question: "72의 법칙이란?", answer: "72를 연 수익률(%)로 나누면 투자금이 2배가 되는 대략적인 연수를 구할 수 있는 법칙입니다." },
        { question: "인플레이션이 투자에 미치는 영향은?", answer: "인플레이션은 화폐 가치를 낮추므로, 명목 수익률에서 물가상승률을 빼야 실질 수익률을 알 수 있습니다." },
      ],
    },
  },
  {
    id: "income-tax-calculator",
    name: "종합소득세 계산기",
    description: "근로·사업·기타소득 합산 5월 종합소득세 납부·환급 예상액 계산",
    icon: "🧮",
    category: "finance",
    path: "/finance/income-tax-calculator",
    keywords: ["종합소득세", "종합소득세계산기", "5월종합소득세", "프리랜서세금", "사업소득세", "납부세액", "환급세액", "소득세신고"],
    relatedIds: ["salary-calculator", "vat-calculator", "severance-calculator"],
    seo: {
      title: "종합소득세 계산기 2026 — 납부·환급 세액 계산 | Tooly",
      description: "2026년 5월 종합소득세 신고 전 예상 납부·환급액을 계산하세요. 근로소득·사업소득·기타소득 합산, 인적공제, 기납부세액 차감까지 자동 계산.",
      h1: "종합소득세 계산기 2026",
      faq: [
        { question: "종합소득세 신고 기간은?", answer: "매년 5월 1일부터 31일까지 신고·납부합니다. 성실신고확인 대상자는 6월 30일까지 연장됩니다." },
        { question: "프리랜서도 종합소득세를 신고해야 하나요?", answer: "네. 3.3% 원천징수된 기타소득·사업소득이 있으면 5월에 종합소득세를 신고해야 합니다. 실제 세율이 3%보다 낮으면 환급을 받을 수 있습니다." },
        { question: "무신고 시 가산세는?", answer: "일반 무신고 시 납부세액의 20%, 부정 무신고 시 40%의 가산세가 부과됩니다. 기한 후 신고 시 50% 감면됩니다." },
        { question: "종합소득세와 근로소득 연말정산의 차이는?", answer: "연말정산은 근로소득만 있는 직장인이 회사를 통해 납부세액을 정산하는 절차입니다. 부업·사업소득이 있으면 연말정산 외에 추가로 종합소득세를 신고해야 합니다." },
        { question: "기납부세액이란?", answer: "이미 원천징수된 세금입니다. 직장인의 경우 매월 원천징수된 근로소득세, 프리랜서의 경우 지급처에서 공제한 3.3%의 소득세 부분(3%)이 해당합니다." },
      ],
    },
  },
  // 일반 계산기 1차 배치 (7종)
  {
    id: "deposit-calculator",
    name: "예적금 이자 계산기",
    description: "정기예금·적금 세후 만기수령액 자동 계산",
    icon: "🏦",
    category: "finance",
    path: "/finance/deposit-calculator",
    keywords: ["예금", "적금", "이자", "만기", "세후", "세전", "정기예금", "적금이자계산"],
    relatedIds: ["compound-interest", "salary-calculator", "loan-calculator"],
    seo: {
      title: "예적금 이자 계산기 - 세후 수령액 계산 | Tooly",
      description: "정기예금·적금 이자를 세전/세후로 계산합니다. 이자소득세(15.4%) 공제 후 만기 실수령액을 확인하세요.",
      h1: "예적금 이자 계산기",
      faq: [
        { question: "이자소득세란?", answer: "금융소득에 부과되는 세금으로, 일반과세 시 15.4%(소득세 14% + 지방소득세 1.4%)가 적용됩니다." },
        { question: "예금과 적금의 차이는?", answer: "예금은 목돈을 한 번에 맡기는 거치식, 적금은 매월 일정액을 납입하는 적립식입니다." },
        { question: "세후 이자란?", answer: "이자에서 이자소득세(15.4%)를 공제한 후 실제로 받는 금액입니다." },
        { question: "비과세 저축이란?", answer: "이자소득세가 면제되는 금융상품으로, 가입 자격과 한도가 제한됩니다." },
      ],
    },
  },
  {
    id: "rent-conversion",
    name: "전월세 전환 계산기",
    description: "전세 보증금↔월세 전환, 법정 전환율 적용",
    icon: "🔑",
    category: "finance",
    path: "/finance/rent-conversion",
    keywords: ["전세", "월세", "전환율", "보증금", "전월세", "전세전환", "월세계산"],
    relatedIds: ["loan-calculator", "area-converter", "capital-gains-tax"],
    seo: {
      title: "전월세 전환 계산기 - 보증금 월세 변환 | Tooly",
      description: "전세 보증금과 월세를 법정 전환율 기준으로 상호 변환합니다. 전세가 유리한지 월세가 유리한지 비교하세요.",
      h1: "전월세 전환 계산기",
      faq: [
        { question: "전월세 전환율이란?", answer: "보증금을 월세로, 또는 월세를 보증금으로 환산할 때 사용하는 비율입니다. 법정 전환율은 한국은행 기준금리에 대통령령으로 정한 이율을 더한 값입니다." },
        { question: "법정 전환율은 얼마인가요?", answer: "2026년 기준 전월세 전환율 상한은 한국은행 기준금리 + 2%입니다." },
        { question: "전세가율이란?", answer: "매매가 대비 전세보증금의 비율로, 지역·시기에 따라 달라집니다. 70% 이상이면 깡통전세 위험이 있습니다." },
      ],
    },
  },
  {
    id: "severance-calculator",
    name: "퇴직금 계산기",
    description: "근속기간·평균임금으로 예상 퇴직금 자동 계산",
    icon: "📋",
    category: "finance",
    path: "/finance/severance-calculator",
    keywords: ["퇴직금", "퇴직", "근속", "평균임금", "퇴직금계산기", "퇴직금얼마"],
    relatedIds: ["salary-calculator", "compound-interest", "deposit-calculator"],
    seo: {
      title: "퇴직금 계산기 - 예상 퇴직금 조회 | Tooly",
      description: "입사일, 퇴사일, 월급을 입력하면 예상 퇴직금을 자동으로 계산합니다. 근속 1년·3년·5년·10년별 퇴직금 금액 확인.",
      h1: "퇴직금 계산기",
      faq: [
        { question: "퇴직금 계산법은?", answer: "퇴직금 = 1일 평균임금 × 30일 × (근속일수 ÷ 365)로 계산됩니다." },
        { question: "퇴직금 수령 조건은?", answer: "1년 이상 근무한 근로자가 퇴직 시 수령할 수 있으며, 주 15시간 이상 근로해야 합니다." },
        { question: "퇴직금과 퇴직연금의 차이는?", answer: "퇴직금은 퇴사 시 일시금으로, 퇴직연금(DB/DC)은 재직 중 별도 계좌에 적립되는 방식입니다." },
      ],
    },
  },
  {
    id: "capital-gains-tax",
    name: "양도소득세 계산기",
    description: "부동산 매도 시 양도소득세 얼마? 자동 계산",
    icon: "🏢",
    category: "finance",
    path: "/finance/capital-gains-tax",
    keywords: ["양도소득세", "양도세", "부동산", "매매", "장기보유", "양도세계산기", "부동산세금"],
    relatedIds: ["loan-calculator", "rent-conversion", "area-converter"],
    seo: {
      title: "양도소득세 계산기 - 1세대1주택·고가주택 안분까지 | Tooly",
      description: "취득가·양도가·보유·거주기간으로 양도소득세를 계산합니다. 1세대 1주택 비과세, 12억 초과 고가주택 안분과세, 장기보유 특별공제 표1·표2를 정확히 반영합니다.",
      h1: "양도소득세 계산기",
      faq: [
        { question: "양도소득세란 무엇인가요?", answer: "토지·건물 등 부동산이나 분양권을 팔아 얻은 이익(양도차익)에 부과되는 세금입니다. 양도차익은 양도가액에서 취득가액과 필요경비를 뺀 금액이며, 여기에 장기보유 특별공제와 기본공제 250만원을 차감한 과세표준에 6~45% 누진세율을 적용합니다." },
        { question: "1세대 1주택인데 양도세를 내야 하나요?", answer: "1세대 1주택이고 2년 이상 보유(취득 당시 조정대상지역은 2년 거주 포함)했으며 양도가액이 12억 이하라면 비과세입니다. 다만 양도가액이 12억을 초과하는 고가주택은 12억 초과분에 해당하는 비율만큼만 과세됩니다." },
        { question: "12억 초과 고가주택은 세금을 어떻게 계산하나요?", answer: "전체 양도차익에 세금을 매기는 것이 아니라 '전체 양도차익 × (양도가액-12억) ÷ 양도가액'으로 과세 대상 양도차익을 안분합니다. 예를 들어 15억에 판 1주택의 양도차익이 5억이면 과세 대상은 5억×(15억-12억)/15억=1억 원입니다." },
        { question: "장기보유 특별공제 표1과 표2는 어떻게 다른가요?", answer: "일반 부동산(표1)은 3년 6%부터 15년 이상 최대 30%까지 공제됩니다. 1세대 1주택(표2)은 보유기간 연 4%(최대 40%)와 거주기간 연 4%(최대 40%)를 더해 최대 80%까지 공제됩니다. 거주 2년 미만이면 표1이 적용됩니다." },
        { question: "일시적 2주택도 비과세가 되나요?", answer: "이사 등으로 신규 주택을 먼저 취득해 일시적으로 2주택이 된 경우, 종전 주택을 신규 주택 취득일부터 3년 이내에 양도하고 종전 주택이 2년 이상 보유 등 요건을 갖추면 1세대 1주택으로 보아 비과세 받을 수 있습니다." },
        { question: "필요경비로 인정되는 항목은 무엇인가요?", answer: "취득세·등록세, 법무사 보수, 취득·양도 시 중개수수료, 발코니 확장이나 새시 교체 같은 자본적 지출이 인정됩니다. 반면 도배·장판 등 수익적 지출, 보유 중 낸 재산세·종부세, 대출 이자, 증빙 없는 비용은 인정되지 않습니다." },
        { question: "양도세는 언제까지 신고하나요?", answer: "양도일(잔금일과 등기일 중 빠른 날)이 속한 달의 말일부터 2개월 이내에 예정신고·납부해야 합니다. 한 해에 두 건 이상 양도해 합산이 필요하면 다음 해 5월에 확정신고를 합니다. 기한을 넘기면 신고불성실·납부지연 가산세가 부과됩니다." },
        { question: "다주택자는 세율이 어떻게 되나요?", answer: "다주택자에 대한 양도세 중과세율(기본세율+20~30%p)은 정부 정책에 따라 한시적으로 배제되거나 변동됩니다. 본 계산기는 기본 누진세율(6~45%)로 계산하므로, 중과 대상 여부는 양도 시점의 최신 규정과 세무 전문가를 통해 확인하세요." },
      ],
    },
  },
  {
    id: "vat-calculator",
    name: "부가세 계산기",
    description: "부가세 포함·별도 금액 즉시 계산",
    icon: "🧾",
    category: "finance",
    path: "/finance/vat-calculator",
    keywords: ["부가세", "부가가치세", "VAT", "공급가액", "세금계산서", "부가세계산기"],
    relatedIds: ["salary-calculator", "capital-gains-tax"],
    seo: {
      title: "부가세 계산기 - VAT 포함/별도 변환 | Tooly",
      description: "공급가액에서 부가세를 계산하거나, 합계금액에서 부가세를 추출합니다. 사업자 세금계산서 발행 시 활용하세요.",
      h1: "부가세 계산기",
      faq: [
        { question: "부가가치세란?", answer: "상품이나 서비스의 거래 시 부과되는 간접세로, 한국에서는 일반적으로 10%입니다." },
        { question: "부가세 신고 기간은?", answer: "일반과세자는 1월·7월(확정), 4월·10월(예정) 연 4회, 간이과세자는 1월 연 1회 신고합니다." },
        { question: "면세와 영세의 차이는?", answer: "면세는 부가세가 아예 없는 것(의료, 교육 등), 영세율은 세율이 0%인 것(수출 등)으로 매입세액 환급이 가능합니다." },
      ],
    },
  },
  {
    id: "area-converter",
    name: "평수 계산기",
    description: "평수↔제곱미터, 아파트 면적 단위 변환",
    icon: "📐",
    category: "convert",
    path: "/convert/area-converter",
    keywords: ["평수", "제곱미터", "평", "m2", "면적", "아파트", "평수계산기", "평방미터"],
    relatedIds: ["loan-calculator", "rent-conversion"],
    seo: {
      title: "평수 계산기 - 평 제곱미터(m²) 변환 | Tooly",
      description: "평수를 제곱미터로, 제곱미터를 평수로 간편하게 변환합니다. 아파트 전용면적·공급면적 모두 활용 가능.",
      h1: "평수 계산기",
      faq: [
        { question: "1평은 몇 제곱미터인가요?", answer: "1평은 약 3.3058m²입니다." },
        { question: "전용면적과 공급면적의 차이는?", answer: "전용면적은 실제 사용 가능한 공간, 공급면적은 전용면적에 주거공용면적(복도, 계단 등)을 합한 것입니다." },
        { question: "분양면적에 평이 사용되는 이유는?", answer: "법적으로는 m²를 사용하지만, 관행적으로 평(3.3058m²)이 여전히 부동산 거래에서 통용됩니다." },
      ],
    },
  },
  {
    id: "currency-converter",
    name: "환율 변환기",
    description: "원화·달러·엔화·유로·위안 실시간 환산",
    icon: "💱",
    category: "convert",
    path: "/convert/currency-converter",
    keywords: ["환율", "달러", "엔화", "위안", "유로", "원화", "환전", "환율계산기", "달러환산"],
    relatedIds: ["compound-interest", "deposit-calculator"],
    seo: {
      title: "환율 계산기 - 실시간 환율 변환 | Tooly",
      description: "원화와 주요 외화(달러·엔화·유로·위안) 간 환율을 실시간으로 변환합니다. 해외여행·해외송금 전 환산 금액 확인.",
      h1: "환율 변환기",
      faq: [
        { question: "환율은 어디서 가져오나요?", answer: "한국수출입은행 환율 정보를 기반으로 매일 업데이트됩니다." },
        { question: "매매기준율과 현찰 환율의 차이는?", answer: "매매기준율은 은행 간 거래 기준, 현찰 환율은 실제 환전 시 적용되며 환전 수수료가 포함되어 더 비쌉니다." },
        { question: "환율 우대란?", answer: "은행이나 증권사에서 환전 수수료를 일정 비율 할인해주는 것으로, 온라인 환전 시 50~90% 우대가 일반적입니다." },
      ],
    },
  },
  // Phase 1.5 — 건강 카테고리
  {
    id: "bmi-calculator",
    name: "BMI 계산기",
    description: "키·체중으로 BMI와 비만도 즉시 확인",
    icon: "⚖️",
    category: "health",
    path: "/health/bmi-calculator",
    keywords: ["BMI", "체질량지수", "비만", "체중", "키", "비만도", "BMI계산기", "표준체중"],
    relatedIds: ["bmr-calculator", "calorie-calculator"],
    seo: {
      title: "BMI 계산기 - 체질량지수 비만도 측정 | Tooly",
      description: "키와 체중을 입력하면 BMI(체질량지수)를 계산하고 비만도를 판정합니다. 대한비만학회 기준(정상 18.5~22.9) 적용.",
      h1: "BMI 계산기",
      faq: [
        { question: "BMI란 무엇인가요?", answer: "BMI(Body Mass Index)는 체중(kg)을 키(m)의 제곱으로 나눈 값으로, 비만도를 간접적으로 측정하는 지표입니다." },
        { question: "정상 BMI 범위는?", answer: "대한비만학회 기준 18.5~22.9가 정상, 23~24.9가 과체중, 25 이상이 비만입니다." },
        { question: "BMI의 한계는?", answer: "BMI는 근육량을 반영하지 못해 운동선수는 정상 체중이어도 비만으로 판정될 수 있습니다. 체지방률과 함께 확인하세요." },
        { question: "소아청소년 BMI는 다르게 판정하나요?", answer: "네, 소아청소년은 같은 성별·연령 집단의 백분위수로 판정하며, 85백분위수 이상이 과체중입니다." },
      ],
    },
  },
  {
    id: "bmr-calculator",
    name: "기초대사량 계산기",
    description: "성별·나이별 하루 기초대사량(BMR) 자동 계산",
    icon: "🔥",
    category: "health",
    path: "/health/bmr-calculator",
    keywords: ["기초대사량", "BMR", "대사량", "칼로리", "다이어트", "기초대사량계산기"],
    relatedIds: ["bmi-calculator", "calorie-calculator"],
    seo: {
      title: "기초대사량 계산기 - BMR 자동 계산 | Tooly",
      description: "성별, 키, 체중, 나이를 입력하면 하루 기초대사량(BMR)을 계산합니다. 해리스-베네딕트·미플린 공식 선택 가능.",
      h1: "기초대사량 계산기",
      faq: [
        { question: "기초대사량이란?", answer: "생명 유지에 필요한 최소한의 에너지량으로, 아무 활동을 하지 않아도 소모되는 칼로리입니다." },
        { question: "해리스-베네딕트 공식과 미플린 공식의 차이는?", answer: "해리스-베네딕트(1919)는 전통적 공식이고, 미플린-세인트 지어(1990)가 현대인 체형에 더 정확합니다." },
        { question: "기초대사량을 높이려면?", answer: "근력 운동으로 근육량을 늘리면 기초대사량이 올라갑니다. 근육 1kg당 약 13kcal/일을 추가로 소모합니다." },
      ],
    },
  },
  {
    id: "calorie-calculator",
    name: "칼로리 계산기",
    description: "활동 수준별 일일 권장 칼로리 계산",
    icon: "🥗",
    category: "health",
    path: "/health/calorie-calculator",
    keywords: ["칼로리", "일일칼로리", "다이어트", "식단", "권장칼로리", "칼로리계산기"],
    relatedIds: ["bmr-calculator", "bmi-calculator"],
    seo: {
      title: "칼로리 계산기 - 일일 권장 칼로리 계산 | Tooly",
      description: "기초대사량과 활동 수준에 따라 하루 권장 칼로리를 계산합니다. 다이어트·유지·증량 목표별 섭취 칼로리 안내.",
      h1: "일일 칼로리 계산기",
      faq: [
        { question: "일일 권장 칼로리는 어떻게 계산하나요?", answer: "기초대사량(BMR)에 활동계수를 곱하여 산출합니다. 활동이 많을수록 더 많은 칼로리가 필요합니다." },
        { question: "활동계수란?", answer: "일상 활동 수준을 수치화한 것으로, 좌식(1.2)부터 매우 활동적(1.9)까지 5단계로 나뉩니다." },
        { question: "다이어트 시 적정 칼로리 감소량은?", answer: "하루 500kcal 정도 줄이면 주당 약 0.5kg 감량이 가능합니다. 기초대사량 이하로 줄이면 건강에 해롭습니다." },
      ],
    },
  },
  // Phase 1.5 — 날짜 카테고리
  {
    id: "dday-calculator",
    name: "D-Day 계산기",
    description: "시험·기념일·출산예정일까지 D-Day 카운트다운",
    icon: "📅",
    category: "date",
    path: "/date/dday-calculator",
    keywords: ["디데이", "D-Day", "남은날", "카운트다운", "D데이계산기", "시험디데이"],
    relatedIds: ["date-difference", "age-calculator", "workday-calculator"],
    seo: {
      title: "D-Day 계산기 - 남은 일수 계산 | Tooly",
      description: "목표 날짜까지 남은 일수를 계산합니다. 수능·공무원시험·기념일·출산 예정일 D-Day 카운트다운.",
      h1: "D-Day 계산기",
      faq: [
        { question: "D-Day는 어떻게 계산하나요?", answer: "목표 날짜에서 오늘 날짜를 빼서 남은 일수를 계산합니다. D-100은 목표일 100일 전을 의미합니다." },
        { question: "D-Day와 D+Day의 차이는?", answer: "D-Day는 목표일까지 남은 날을 카운트다운하고, D+Day는 특정 날짜로부터 지난 일수를 카운트업합니다." },
        { question: "D-100은 목표일 포함인가요?", answer: "D-Day 계산에서 D-0이 목표일 당일이므로, D-100은 목표일로부터 정확히 100일 전입니다." },
      ],
    },
  },
  {
    id: "date-difference",
    name: "날짜 차이 계산기",
    description: "두 날짜 사이 기간(일·주·월·년) 계산",
    icon: "📆",
    category: "date",
    path: "/date/date-difference",
    keywords: ["날짜차이", "날짜계산", "일수", "기간", "날짜차이계산기"],
    relatedIds: ["dday-calculator", "workday-calculator", "age-calculator"],
    seo: {
      title: "날짜 차이 계산기 - 두 날짜 사이 기간 | Tooly",
      description: "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다. 계약 만료일, 보험 기간, 임신 주수 계산에 활용하세요.",
      h1: "날짜 차이 계산기",
      faq: [
        { question: "윤년은 반영되나요?", answer: "네, 윤년(2월 29일)을 포함하여 정확한 일수를 계산합니다." },
        { question: "월 차이는 어떻게 계산하나요?", answer: "시작일과 종료일의 연·월 차이를 계산하며, 일수가 남으면 별도로 표시합니다." },
        { question: "영업일만 계산할 수 있나요?", answer: "영업일 계산은 근무일수 계산기를 이용해주세요. 이 계산기는 달력일 기준입니다." },
      ],
    },
  },
  {
    id: "age-calculator",
    name: "만 나이 계산기",
    description: "생년월일로 만 나이 및 생일 D-Day 계산",
    icon: "🎂",
    category: "date",
    path: "/date/age-calculator",
    keywords: ["만나이", "나이계산", "생년월일", "한국나이", "만나이계산기", "나이변환"],
    relatedIds: ["dday-calculator", "date-difference"],
    seo: {
      title: "만 나이 계산기 - 생년월일 나이 계산 | Tooly",
      description: "생년월일을 입력하면 만 나이와 다음 생일까지 남은 일수를 계산합니다. 2023년 만 나이 통일법 기준 적용.",
      h1: "만 나이 계산기",
      faq: [
        { question: "만 나이란?", answer: "태어난 날을 0세로 시작하여 생일이 지날 때마다 1세씩 증가하는 국제 표준 나이 계산법입니다. 2023년부터 한국도 만 나이를 공식 사용합니다." },
        { question: "만 나이와 세는 나이의 차이는?", answer: "만 나이는 0세에서 시작해 생일마다 1세 증가, 세는 나이는 태어나면 1살이고 매년 1월 1일에 1살 증가합니다." },
        { question: "2023년 만 나이 통일법이란?", answer: "2023년 6월부터 법적·행정적으로 만 나이를 기준으로 통일하는 법이 시행되었습니다." },
      ],
    },
  },
  {
    id: "workday-calculator",
    name: "근무일수 계산기",
    description: "주말·공휴일 제외 영업일수 자동 계산",
    icon: "💼",
    category: "date",
    path: "/date/workday-calculator",
    keywords: ["근무일수", "영업일", "공휴일", "연차", "출근일", "영업일계산기"],
    relatedIds: ["date-difference", "dday-calculator", "severance-calculator"],
    seo: {
      title: "근무일수 계산기 - 영업일 계산 (공휴일 제외) | Tooly",
      description: "두 날짜 사이의 근무일수를 공휴일과 주말을 제외하여 계산합니다. 2026년 법정 공휴일·대체공휴일 반영.",
      h1: "근무일수 계산기",
      faq: [
        { question: "어떤 공휴일이 반영되나요?", answer: "2026년 대한민국 법정 공휴일(대체공휴일 포함)과 주말(토·일)이 제외됩니다." },
        { question: "대체공휴일은 반영되나요?", answer: "네, 2026년 대한민국 법정 대체공휴일이 모두 반영되어 있습니다." },
        { question: "연차 사용일수도 제외할 수 있나요?", answer: "현재는 공휴일과 주말만 제외합니다. 개인 연차는 결과에서 직접 차감해주세요." },
      ],
    },
  },
  // Phase 1.5 — 생활 카테고리
  {
    id: "gpa-calculator",
    name: "학점 계산기",
    description: "과목별 성적으로 평균 학점(GPA) 자동 계산",
    icon: "🎓",
    category: "life",
    path: "/life/gpa-calculator",
    keywords: ["학점", "평점", "GPA", "성적", "대학교", "학점계산기", "평균학점"],
    relatedIds: ["percent-calculator"],
    seo: {
      title: "학점 계산기 - 평균 학점(GPA) 계산 | Tooly",
      description: "과목별 학점과 성적을 입력하면 평균 학점을 자동으로 계산합니다. 4.3/4.5 만점 모두 지원. 취업·대학원 지원 전 학점 확인.",
      h1: "학점 계산기",
      faq: [
        { question: "4.3 만점과 4.5 만점의 차이는?", answer: "4.5 만점 체계는 A+를 4.5로, 4.3 만점 체계는 A+를 4.3으로 계산합니다. 학교마다 다르니 본인의 학교 기준을 확인하세요." },
        { question: "전공 학점과 전체 학점의 차이는?", answer: "전공 학점은 전공 과목만의 평균, 전체 학점은 교양 포함 모든 과목의 평균입니다. 대부분의 기업은 전체 학점을 봅니다." },
        { question: "P/F 과목은 학점에 포함되나요?", answer: "Pass/Fail 과목은 학점 계산에서 제외됩니다. 학점 수에는 포함되지 않습니다." },
      ],
    },
  },
  {
    id: "electricity-calculator",
    name: "전기요금 계산기",
    description: "월 사용량별 전기요금 누진세 자동 계산",
    icon: "⚡",
    category: "life",
    path: "/life/electricity-calculator",
    keywords: ["전기요금", "전기세", "누진세", "한전", "전력", "전기요금계산기", "전기세계산"],
    relatedIds: ["percent-calculator"],
    seo: {
      title: "전기요금 계산기 - 누진세 자동 계산 | Tooly",
      description: "월 사용량을 입력하면 한전 누진세를 적용한 전기요금을 계산합니다. 여름철 전기요금 폭탄 미리 예측하세요.",
      h1: "전기요금 계산기",
      faq: [
        { question: "전기요금 누진세란?", answer: "전기 사용량이 많을수록 단가가 높아지는 단계별 요금제입니다. 주거용은 구간별로 다른 단가가 적용됩니다." },
        { question: "누진세 구간은 어떻게 되나요?", answer: "주거용 전기요금은 사용량에 따라 1~3구간으로 나뉘며, 구간이 높을수록 kWh당 단가가 높아집니다." },
        { question: "여름철 전기요금이 더 비싼 이유는?", answer: "7~8월은 냉방으로 사용량이 급증하여 높은 누진 구간에 도달하기 쉽습니다. 한전에서 하계 할인을 제공하기도 합니다." },
      ],
    },
  },
  {
    id: "percent-calculator",
    name: "퍼센트 계산기",
    description: "퍼센트·할인율·증감률 즉시 계산",
    icon: "🔢",
    category: "life",
    path: "/life/percent-calculator",
    keywords: ["퍼센트", "백분율", "%", "비율", "변화율", "할인율", "퍼센트계산기", "할인계산"],
    relatedIds: ["vat-calculator", "gpa-calculator"],
    seo: {
      title: "퍼센트 계산기 - 비율 변화율 계산 | Tooly",
      description: "퍼센트 값, 비율, 증감률, 할인율을 간편하게 계산합니다. 쇼핑 할인 금액, 세금 비율, 성장률 계산에 활용하세요.",
      h1: "퍼센트 계산기",
      faq: [
        { question: "퍼센트는 어떻게 계산하나요?", answer: "퍼센트(%)는 전체를 100으로 놓았을 때의 비율입니다. A의 B% = A × B ÷ 100으로 계산합니다." },
        { question: "증가율과 감소율은 어떻게 계산하나요?", answer: "증가율 = (새 값 - 원래 값) ÷ 원래 값 × 100. 감소율도 같은 공식이며 결과가 음수면 감소입니다." },
        { question: "할인율 계산은 어떻게 하나요?", answer: "원래 가격에서 할인 후 가격을 빼고 원래 가격으로 나눈 뒤 100을 곱하면 할인율(%)이 됩니다." },
      ],
    },
  },
  {
    id: "speed-converter",
    name: "속도 단위 변환기",
    description: "km/h · m/s · mph 속도 단위 변환",
    icon: "🚗",
    category: "life",
    path: "/life/speed-converter",
    keywords: ["속도", "km/h", "m/s", "mph", "단위변환", "속도변환기"],
    relatedIds: ["area-converter", "currency-converter"],
    seo: {
      title: "속도 단위 변환기 - km/h m/s mph 변환 | Tooly",
      description: "km/h, m/s, mph 속도 단위를 간편하게 상호 변환합니다. 자동차·항공·스포츠 속도 단위 변환.",
      h1: "속도 단위 변환기",
      faq: [
        { question: "km/h를 m/s로 어떻게 변환하나요?", answer: "km/h 값을 3.6으로 나누면 m/s가 됩니다. 예: 100km/h ÷ 3.6 ≈ 27.78m/s" },
        { question: "마하(Mach)는 얼마나 빠른가요?", answer: "마하 1은 음속으로 약 1,225km/h(해수면 기준)입니다. 전투기가 마하 2 이상으로 비행합니다." },
        { question: "노트(knot)란?", answer: "항해·항공에서 사용하는 속도 단위로, 1노트는 시속 1.852km입니다." },
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
