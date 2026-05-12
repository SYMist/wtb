# 할 일 목록

미팅 결론과 논의 내용을 기반으로 정리한 향후 작업 목록입니다.

---

## 즉시 실행 (2026-05-12 기준)

- [x] PR #51 머지 (income-tax-ux 브랜치: 네이버 포스팅 플레이북 수정 + ⚡ 버튼 UX 수정 + noindex + TODO/WORKLOG)
- [x] 프로그래매틱 SEO 페이지 35개 noindex 처리 + sitemap 제거 (크롤 버짓 집중)
- [ ] 네이버 블로그 종합소득세 포스팅 실제 발행 (`marketing/naver-post-income-tax-2026.md` 참고, 스크린샷 5장 삽입 필요)
- [ ] 발행 후 네이버 서치어드바이저 수집 요청

---

## 콘텐츠 / 마케팅

### 네이버 블로그 지속 발행 (월 4~8편 목표)

현재까지 6편 발행 완료 (연봉, 주담대, 복리, 최저임금, D-Day, 전기요금, BMI, 종합소득세 신고).
다음 발행 후보 (플레이북 주제 선정 원칙 준수):

- [ ] 퇴직금 얼마 받나? 근속연수별 세후 실수령액 직접 계산 → `/finance/severance-calculator` 연결
- [ ] 전세 vs 월세 뭐가 유리? 보증금·전월세 전환율 직접 계산해보기 → `/finance/rent-conversion` 연결
- [ ] 주담대 원리금균등 vs 원금균등 — 10년 이자 차이 직접 계산 → `/finance/loan-calculator` 연결
- [ ] 2026 기준금리 2.5% 시대 — 예금·대출·투자에 미치는 영향 → `/data/rates/base` 연결
- [ ] 만 나이 헷갈릴 때 — 연 나이·세는 나이·만 나이 정확히 계산 → `/date/korean-age` 연결
- [ ] BMI 정상인데 체지방은 높다? — 체질량지수 한계와 체성분 분석 → `/health/bmi` 연결

### GA4 / 네이버 블로그 통계 분석

- [ ] Google Analytics GA4에서 페이지별 유입·이탈률 확인 (어떤 계산기가 트래픽을 끌어오는지)
- [ ] Google Search Console에서 상위 노출 키워드 확인 (CTR 낮은 키워드 title/description 개선)
- [ ] 네이버 블로그 통계에서 유입 검색어 및 저장 수 확인
- [ ] 포스팅 댓글 달리면 24시간 내 응답 (C-Rank 활동성)

---

## 계산기 확장

GA4 트래픽 데이터 확인 후 수요가 확인된 항목 우선 개발.

- [ ] **청약 가점 계산기** — 무주택 기간·부양가족수·청약통장 가입 기간 입력 → 청약 가점 자동 계산 (검색량 높음)
- [ ] **종합소득세 계산기 공제 확장** — 현재 기본·연금·자녀공제만 있음. 의료비·교육비·기부금 세액공제 추가
- [ ] **건강보험료 계산기** — 직장가입자/지역가입자 구분, 피부양자 등재 여부 (종합소득세와 연계 가능)
- [ ] **프로그래매틱 SEO 성과 분석** — GSC에서 `/finance/salary-calculator/[amount]`, `/finance/loan-calculator/[amount]` 페이지 클릭수 확인 → 미흡 시 콘텐츠 보강

---

## 데이터 포털 확장

현재 라이브: 기준금리, 주담대, 정기예금, 국고채10년, USD/KRW, JPY/KRW, CNY/KRW, EUR/KRW (10페이지).

- [ ] **코스피 지수 시계열** (`/data/market/kospi`) — ECOS 또는 KRX 공공 API 활용
- [ ] **소비자물가지수 CPI** (`/data/prices/cpi`) — 통계청 KOSIS API, 월별 시계열
- [ ] **/data 허브 페이지** (`/data`) — rates·exchange·market·prices 4개 섹션 통합 랜딩

---

## 수익화 / AdSense 최적화

- [ ] AdSense 대시보드에서 RPM·CTR 확인 (현재 pub-5716436301710258 auto ads + 3개 슬롯)
- [ ] 트래픽 상위 페이지에서 광고 슬롯 위치 A/B 비교 (sticky sidebar 효과 확인)
- [ ] AdSense 실험 기능으로 광고 밀도 최적화

---

## 기술 부채

- [ ] 2027년 공휴일 데이터 추가 (`lib/data/holidays.ts` — 연도 dict 구조 적용 완료, 데이터만 추가하면 됨)
- [ ] 종합소득세 계산기 — 기납부세액 소득세(3%)·지방소득세(0.3%) 분리 입력 UX 개선 검토
- [ ] 블로그 포스트 썸네일 이미지 보강 (현재 일부 포스트 thumbnail 미설정)

---

## Phase 2 (장기)

- [ ] 크롤링·공공 API 기반 콘텐츠 확장 (KOSIS, 금융감독원 등)
- [ ] 추가 계산기 검토 — GA4 검색 트래픽 분석 후 결정
- [ ] 네이버 인플루언서 도전 검토 (팔로워 일정 수 확보 후)

---

## 완료된 항목

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

### 기술 부채 (완료)

- [x] 2026년 공휴일 데이터 멀티이어 dict 구조 리팩토링
- [x] 연봉 계산기 소득세 과다 계산 버그 수정 (근로소득공제 + 특별소득공제 + 근로소득세액공제)
- [x] 환율/금리 데이터 fetch 스크립트 `ECOS_API_KEY`로 통일 + 자동화
