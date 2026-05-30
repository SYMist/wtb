# 할 일 목록

> **2026-05-30 전략 전환** (출처: Obsidian `wiki/blog/monetization-todos.md`). 한동안 방치 후 재시작하며 방향 재정의.
>
> **핵심**: 부업 리소스 100%를 Tooly로 집중. Tooly = "범용 계산기 사이트" ❌ → **"한국 금융 의사결정 깊이 포털"** ⭕.
> 계산기는 트래픽 자석이 아니라 **제휴 회수(전환)면**. AdSense는 덤, 진짜 회수는 **금융 비교 제휴(대출·보험)**.
> 범용 계산기(만나이·BMI·환율 = 네이버 위젯에 막힘)는 **신규 투자 중단, 유지만**.

---

## ⚠️ 보류 — 전략 재검토 필요

새 방향(금융 시나리오 깊이 + 제휴 회수)과 어긋나는 기존 계획. Phase 0 검증 결과에 따라 재개 여부 결정.

- [ ] ~~**청약 가점 계산기**~~ — 범용 계산기 성격. 제휴 회수 동선 약함. Phase 1에서 "제휴 단가 높은 1줄기"에 부합하는지 재판단 후 결정
- [ ] ~~건강보험료 계산기~~ — 종소세 연계 가능성은 있으나 우선순위 후순위로 이동
- [ ] ~~범용 계산기 신규 확장 일반~~ — 신규 투자 중단, 유지만

---

## Phase 0 — 검증 먼저 (믿음 말고 신호로)

코드를 더 짜기 전에 트래픽 떡잎 생존 신호부터 확인한다.

- [x] **GA4 재연동** (방치 중 placeholder로 망가져 있던 것 복구) — 측정 ID `G-3FEVQE9CED` 주입·배포·검증 (2026-05-30)
- [x] **GSC 진단 완료** — 🔴 적신호: 3개월 노출 0 / 클릭 0 / 38크롤링 0색인("크롤링됨-색인 안 됨"). **진짜 원인 발견 = 계산기 페이지 전체가 클라이언트 전용 렌더링 → Googlebot에 빈 껍데기**. 즉 수요 문제가 아니라 기술 버그로 사이트가 안 보였던 것 (2026-05-30)
- [x] **사이트 전체 SSR 복구** — 18개 계산기 페이지 서버 렌더링 전환·배포·검증(ld+json·본문 전부 HTML 노출). 이제 색인 재시도 가능 (2026-05-30) → 기술 부채 섹션 참고
- [x] 거인이 무시하는 **롱테일 금융 시나리오 키워드 선정** = **양도세(1세대1주택 12억 초과 안분)** 를 쐐기로 선정·페이지 보강 완료. ⏳ *수 주 내 색인·노출 뜨는지 관찰은 진행 중(미완)*
- [x] 프로그래매틱 SEO 성과 확인 — GSC 색인 0이라 클릭도 0. 동일 SSR 버그 영향. SSR 복구 후 재확인 필요
- [x] **GSC 색인 재요청 완료** (SSR 복구 후 주요 페이지 + 양도세 포스트 재크롤 요청, 2026-05-30)
- [x] **양도세 블로그 글 발행 완료** (권위 링크 주입 + 해당 포스트 색인 재요청, 2026-05-30)

> **Phase 0 = 관찰 대기 구간.** 능동 작업 전부 완료. 유일하게 남은 것: **1~2주 후(≈6월 중순) GSC 재색인 여부 + GA 유입 신호 확인** → 색인·노출 뜨면 Phase 1 본격화, 계속 0이면 부업 매체 재고. 그 사이는 데이터 포털(해자)·Phase 2 제휴 조사 등 비-검증 작업 진행 가능.

---

## Phase 1 — 포지셔닝 좁히기

- [~] 거인 빈 땅에 집중: 복잡한 금융 시나리오 중 **제휴 단가 높은 1줄기** 선정 — 쐐기로 **양도세** 우선 착수(제휴 단가 관점 정식 선정은 Phase 0 신호 확인 후)
- [x] 선정 줄기 계산기/콘텐츠 깊이 보강 — **양도세 페이지**: 고가주택 12억 초과 안분과세 + 1세대1주택 장특공 표2(보유+거주 최대80%) + 거주기간 입력 + 시나리오 깊이 콘텐츠 + FAQ 3→8 (2026-05-30)
- [ ] 범용 계산기(만나이·BMI·환율 등)는 **신규 투자 중단, 유지만**

---

## Phase 2 — 회수(제휴) 설계 *(AdSense는 덤으로만)*

- [ ] 금융 비교 제휴(대출·보험) 연결 가능한 **제휴 네트워크/플랫폼** 조사 — ⚠️ 규제(대출모집인·보험 GA) 우회 경로 확인
- [ ] 의도 높은 계산기(대출·보험)에 **제휴 CTA** 설계
- [ ] **ECOS 데이터 시계열 일일 fetch 지속** — 시간이 해자(안 모으면 백필 불가). 현재 월 1회 → 일일로 강화 검토
- [ ] AdSense는 현 상태 유지 (RPM·CTR 모니터링만, 신규 최적화 투자 보류)

---

## Phase 3 — 유입

- [ ] **자연 검색 유입을 본체로** (시나리오 롱테일 SEO)
- [x] 네이버 블로그 플레이북 개선 — 역할 재정의(도달·인지/백링크 nofollow 현실), 스마트블록·DIA+ 대응, 롱테일 시나리오 주제 S1~S5, **저품질 회피 종합 섹션**(외부링크 리스크·스터핑·유사문서·발행패턴) (`marketing/naver-blog-playbook.md`, 2026-05-30)
- [ ] 네이버 블로그는 **도달·인지용으로만** 유지 — 홈판 트래픽 = 저의도, Tooly 깔때기로 과신 금지
- [x] **S1 양도세 글(1세대1주택 12억 초과) 발행 완료** — 양도세 페이지로 권위 링크 주입 (2026-05-30)
- [ ] 다음 블로그 후보: S2(일시적 2주택)·S3(전세vs월세 손익) 등 — Phase 0 관찰 결과(색인 회복) 확인 후 착수

---

## 데이터 포털 확장 (해자 축적 — 유지)

ECOS 일일 fetch가 시간 해자이므로 데이터 축적은 지속. 현재 라이브: 기준금리, 주담대, 정기예금, 국고채10년, USD/KRW, JPY/KRW, CNY/KRW, EUR/KRW (10페이지).

- [ ] **코스피 지수 시계열** (`/data/market/kospi`) — ECOS 또는 KRX 공공 API 활용
- [ ] **소비자물가지수 CPI** (`/data/prices/cpi`) — 통계청 KOSIS API, 월별 시계열
- [ ] **/data 허브 페이지** (`/data`) — rates·exchange·market·prices 4개 섹션 통합 랜딩

---

## 기술 부채

- [x] **계산기 페이지 전체 SSR 복구 (2026-05-30)** — `useSearchParams` 훅이 18개 페이지를 클라이언트 전용 렌더링으로 만들어 Googlebot에 빈 껍데기 노출 → 색인 거부의 핵심 원인. 14개는 서버/클라이언트 분리(연봉 계산기 패턴), life 4개는 미사용 훅 제거로 정적화. 전부 배포·검증 완료
- [ ] `eslint.config.mjs` globalIgnores에 `.open-next/**` 추가 — 현재 `npm run lint`가 빌드 산출물 스캔해 OOM
- [ ] `income-tax-calculator/IncomeTaxCalculatorClient.tsx:400` react/no-unescaped-entities 린트 에러 2개 정리
- [ ] 2027년 공휴일 데이터 추가 (`lib/data/holidays.ts` — 연도 dict 구조 적용 완료, 데이터만 추가하면 됨)
- [ ] 종합소득세 계산기 — 기납부세액 소득세(3%)·지방소득세(0.3%) 분리 입력 UX 개선 검토
- [ ] 블로그 포스트 썸네일 이미지 보강 (현재 일부 포스트 thumbnail 미설정)

---

## 완료된 항목

### 계산기 확장 (2026-05-16)

- [x] 퇴직소득세 계산 기능 추가 (`/finance/severance-calculator`) — 세전 퇴직금·퇴직소득세·지방소득세·세후 실수령액 breakdown (PR #54)
- [x] 전세 vs 월세 비용 비교 섹션 추가 (`/finance/rent-conversion`) — 전세 대출 이자 vs 월세 직접 비교, 유리한 쪽 자동 판정 (PR #55)

### 콘텐츠 (2026-05-16)

- [x] 네이버 블로그 포스팅 2편 발행
  - [x] 퇴직금 얼마 받나? 근속연수별 직접 계산해봄
  - [x] 전세 vs 월세 뭐가 유리? 보증금 3억으로 직접 계산

---

### SEO (미팅 #06 기반)

#### Phase A — 즉시 실행

- [x] 가이드 콘텐츠 확충: 각 계산기별 500~1,000자 상세 가이드 작성
- [x] 카테고리 페이지에 서술형 설명 콘텐츠 추가 (thin content 해소)
- [x] JSON-LD FAQ를 계산기당 3~5개로 확장
- [x] Google Search Console 등록 + 사이트맵 제출 (tooly.deluxo.co.kr URL 접두어 속성, sitemap.xml 성공)
- [x] Google Search Console에서 주요 페이지 인덱싱 요청 (URL 검사 도구)
- [x] 네이버 서치어드바이저 등록 + 사이트맵 제출 + 주요 페이지 수집 요청 (24개 URL)
- [x] Google Analytics 연동

#### Phase B — 1~2주 내

- [x] 킬러 계산기 서버/클라이언트 분리 리팩토링 (대출, 복리 — 연봉은 완료)
- [x] Pretendard 웹폰트 명시적 로딩 설정 (CLS 방지)
- [x] Core Web Vitals 점검 (AdSense/GA4를 lazyOnload로 변경 → LCP 6.0s → 3.3s, Performance 61 → 77~89)
- [x] OG 이미지 자동 생성 (`opengraph-image.tsx` + @vercel/og)
- [x] 구조화 데이터 확장 (SoftwareApplication / WebApplication 스키마)

#### Phase C — 3~4주 내

- [x] 프로그래매틱 SEO: 연봉 구간별 사전 계산 페이지 (20개)
- [x] 프로그래매틱 SEO: 대출 금액별 사전 계산 페이지 (15개)
- [x] 각 프로그래매틱 페이지에 구간별 맥락 콘텐츠 차별화 (doorway page 방지)
- [x] sitemap.ts에 프로그래매틱 페이지 동적 추가
- [x] canonical 태그 관리 (메인 계산기 페이지와 중복 방지)
- [x] 네이버 블로그 운영 플레이북 작성 (`marketing/naver-blog-playbook.md`)
- [x] 네이버 블로그 포스팅 2편 발행 (1주차: 연봉 실수령액, 주택담보대출)
- [x] 네이버 블로그 포스팅 2편 발행 (2주차: 복리 계산, 2026 최저임금 실수령액)
- [x] 네이버 블로그 포스팅 4~10편 추가 발행 (3주차~)
  - [x] D-Day 계산기 완전 가이드 (`dday-calculator-guide`)
  - [x] 전기요금 계산 완전 정리 — 누진세 (`electricity-bill-guide`)
  - [x] BMI 계산법과 정상 체중 기준 (`bmi-calculator-guide`)
  - [x] 2026년 5월 종합소득세 신고 가이드 (`income-tax-filing-guide`)
- [x] Google Search Console + 네이버 서치어드바이저에 블로그 4편 색인/수집 요청

---

### 계산기 확장 (2026-05-03 미팅 #08 기반)

- [x] 종합소득세 계산기 (`/finance/income-tax-calculator`) — 5월 세금 시즌 대응
- [x] 종합소득세 계산기 UX 개선 — 근로소득자/프리랜서 유형 선택 토글
- [x] 최저임금 랜딩 페이지 (`/finance/salary-calculator/minimum-wage`) — 홈판 유입 활성화
- [x] 홈페이지 최신 블로그 글 섹션 추가 (`app/page.tsx`)
- [x] 연봉 계산기 최저임금 빠른설정 버튼 추가
- [x] Google Search Console + 네이버 서치어드바이저에 신규 페이지 색인/수집 요청

---

### 콘텐츠 (미팅 #06 기반)

- [x] 블로그/콘텐츠 허브 구축 — 질문형 검색 대응
  - [x] `/blog` (리스트) + `/blog/[slug]` (본문) + `/blog/category/[cat]` 라우트 구현
  - [x] TSX 컴포넌트 기반 포스트 파이프라인 (Cloudflare Workers 호환)
  - [x] 컴포넌트: TL;DR 박스, 목차(TOC), 콜아웃 4종, 비교 테이블, 계산기 CTA 카드, FAQ 아코디언, 관련글 그리드
  - [x] JSON-LD: Article + BreadcrumbList + FAQPage
  - [x] 블로그 OG 이미지 자동 생성
  - [x] 포스트 12편 발행
- [x] 계산기별 대표 아이콘 + 카테고리 페이지 일러스트 추가
- [x] 네이버향 키워드를 description/가이드에 자연스럽게 반영

---

### 인프라 / 배포

- [x] Cloudflare Workers 배포 (https://wtb.mmist0226.workers.dev)
- [x] 커스텀 도메인 연결 (https://tooly.deluxo.co.kr)
- [x] AdSense 등록 및 pub ID 업데이트 (pub-5716436301710258, auto ads 활성)
- [x] AdSense 개별 광고 슬롯 ID 연결 (banner/inline/sidebar 3종)

---

### 데이터 포털 (Phase 2a~ · 미팅 #07 기반)

- [x] ECOS 기준금리 월별 시계열 + `/data/rates/base` 페이지
- [x] GitHub Actions 월 1회 ECOS 자동 갱신 워크플로
- [x] `/data/rates/mortgage` (주담대 평균 금리) 페이지
- [x] `/data/rates/deposit` (정기예금 금리) 페이지
- [x] `/data/rates/treasury-10y` (국고채 10년) 페이지
- [x] `/data/rates` 허브 페이지
- [x] `/data/exchange/usd-krw`, `/data/exchange/jpy-krw`, `/data/exchange/cny-krw`, `/data/exchange/eur-krw`
- [x] `/data/exchange` 허브 페이지
- [x] GH Actions 월 1회 환율 자동 갱신 + `ECOS_API_KEY` 통일

---

### 계산기 확장 (2026-05-16)

- [x] 퇴직소득세 계산 기능 추가 (`/finance/severance-calculator`) — 세전 퇴직금·퇴직소득세·지방소득세·세후 실수령액 breakdown (PR #54)
- [x] 전세 vs 월세 비용 비교 섹션 추가 (`/finance/rent-conversion`) — 전세 대출 이자 vs 월세 직접 비교, 유리한 쪽 자동 판정 (PR #55)

### 콘텐츠 (2026-05-16)

- [x] 네이버 블로그 포스팅 2편 초안 작성
  - [x] 퇴직금 얼마 받나? 근속연수별 직접 계산해봄 (`marketing/naver-post-severance-pay.md`)
  - [x] 전세 vs 월세 뭐가 유리? 보증금 3억으로 직접 계산 (`marketing/naver-post-jeonse-vs-wolse.md`)

### 기술 부채 (완료)

- [x] 2026년 공휴일 데이터 멀티이어 dict 구조 리팩토링
- [x] 연봉 계산기 소득세 과다 계산 버그 수정 (근로소득공제 + 특별소득공제 + 근로소득세액공제)
- [x] 환율/금리 데이터 fetch 스크립트 `ECOS_API_KEY`로 통일 + 자동화
