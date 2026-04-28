export interface BlogCategory {
  id: string;
  name: string;
  description: string;
}

export const blogCategories: BlogCategory[] = [
  {
    id: "guide",
    name: "계산기 가이드",
    description: "Tooly 계산기를 200% 활용하는 방법과 실전 사례.",
  },
  {
    id: "finance-tip",
    name: "금융 상식",
    description: "세금, 대출, 투자, 연말정산 등 일상 금융 지식.",
  },
  {
    id: "data-analysis",
    name: "데이터 분석",
    description: "경제 지표와 공공 데이터로 살펴보는 생활 경제.",
  },
];

export function getBlogCategory(id: string): BlogCategory | undefined {
  return blogCategories.find((c) => c.id === id);
}
