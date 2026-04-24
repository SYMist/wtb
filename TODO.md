# 할 일 목록

미팅 결론과 논의 내용을 기반으로 정리한 향후 작업 목록입니다.

---

## SEO (미팅 #06 기반)

### Phase A — 즉시 실행

- [x] 가이드 콘텐츠 확충: 각 계산기별 500~1,000자 상세 가이드 작성
- [x] 카테고리 페이지에 서술형 설명 콘텐츠 추가 (thin content 해소)
- [x] JSON-LD FAQ를 계산기당 3~5개로 확장
- [x] Google Search Console 등록 + 사이트맵 제출 (tooly.deluxo.co.kr URL 접두어 속성, sitemap.xml 성공)
- [x] Google Search Console에서 주요 페이지 인덱싱 요청 (URL 검사 도구)
- [x] 네이버 서치어드바이저 등록 + 사이트맵 제출 + 주요 페이지 수집 요청 (24개 URL)
- [x] Google Analytics 연동

### Phase B — 1~2주 내

- [x] 킬러 계산기 서버/클라이언트 분리 리팩토링 (대출, 복리 — 연봉은 완료)
- [x] Pretendard 웹폰트 명시적 로딩 설정 (CLS 방지)
- [x] Core Web Vitals 점검 (AdSense/GA4를 lazyOnload로 변경 → LCP 6.0s → 3.3s, Performance 61 → 77~89)
- [x] OG 이미지 자동 생성 (`opengraph-image.tsx` + @vercel/og)
- [x] 구조화 데이터 확장 (SoftwareApplication / WebApplication 스키마)

### Phase C — 3~4주 내

- [x] 프로그래매틱 SEO: 연봉 구간별 사전 계산 페이지 (20개)
- [x] 프로그래매틱 SEO: 대출 금액별 사전 계산 페이지 (15개)
- [x] 각 프로그래매틱 페이지에 구간별 맥락 콘텐츠 차별화 (doorway page 방지)
- [x] sitemap.ts에 프로그래매틱 페이지 동적 추가
- [x] canonical 태그 관리 (메인 계산기 페이지와 중복 방지)
- [x] 네이버 블로그 운영 플레이북 작성 (`marketing/naver-blog-playbook.md`)
- [ ] 네이버 블로그 포스팅 5~10개 발행 (백링크 확보, 플레이북 기반)

---

## 콘텐츠 (미팅 #06 기반)

- [x] 블로그/콘텐츠 허브 구축 — 질문형 검색 대응 ("전세 vs 월세 뭐가 유리한가" 등)
  - [x] 디자인 확보: Stitch로 리스트/본문 페이지 생성 → `design/` 폴더 저장 (code.html, screen.png, DESIGN.md)
  - [x] `/blog` (리스트) + `/blog/[slug]` (본문) + `/blog/category/[cat]` 라우트 구현
  - [x] MDX 파이프라인 (frontmatter: title/date/category/excerpt/thumbnail/author/tldr/faq/relatedSlugs)
  - [x] 컴포넌트: TL;DR 박스, 목차(TOC), 콜아웃 4종, 비교 테이블, 계산기 CTA 카드, FAQ 아코디언, 관련글 그리드
  - [x] JSON-LD: Article + BreadcrumbList + FAQPage
  - [x] sitemap.ts 블로그 URL 동적 추가
  - [x] 샘플 포스트 2개 작성 후 동작 확인 (IRP 절세, 주담대 상환방식)
  - [x] Cloudflare Workers 배포 → 라이브 확인 (https://tooly.deluxo.co.kr/blog, 6개 URL HTTP 200)
  - [x] Google Search Console + 네이버 서치어드바이저에 `/blog`, 포스트 2개, 카테고리 3개 색인/수집 요청
  - [ ] 지속적 포스트 발행 (월 4~8개 목표)
- [ ] 계산기별 대표 일러스트 추가 (이미지 검색 유입)
- [ ] 네이버향 키워드를 description/가이드에 자연스럽게 반영

---

## 인프라 / 배포

- [x] Cloudflare Workers 배포 (https://wtb.mmist0226.workers.dev)
- [x] 커스텀 도메인 연결 (https://tooly.deluxo.co.kr)
- [x] AdSense 등록 및 pub ID 업데이트 (pub-5716436301710258, auto ads 활성)
- [ ] AdSense 개별 광고 슬롯 ID 연결 (AdSlot.tsx `data-ad-slot`)

---

## 데이터 포털 (Phase 2a~ · 미팅 #07 tradingeconomics 참고)

- [x] ECOS 기준금리 월별 시계열 fetch 스크립트 (`scripts/fetch-base-rate-series.ts`)
- [x] `/data/rates/base` 페이지 (7-block 템플릿: Hero/Chart/Table/Narrative/FAQ/CTA/Sources)
- [x] Dataset + FAQPage + BreadcrumbList JSON-LD
- [x] sitemap.ts에 데이터 페이지 추가
- [x] 라이브 배포 확인 (https://tooly.deluxo.co.kr/data/rates/base, HTTP 200)
- [x] Google Search Console + 네이버 서치어드바이저에 `/data/rates/base` 색인/수집 요청
- [x] ~~Cloudflare secret으로 `ECOS_API_KEY` 주입~~ (빌드 타임 JSON 구조라 불필요; GH Actions로 대체)
- [x] `fetch-interest-rates.ts` 환경변수를 `ECOS_API_KEY`로 통일 + 연도 동적화
- [x] GitHub Actions 월 1회 ECOS 자동 갱신 워크플로 (`.github/workflows/update-ecos-data.yml`, 1일 12:00 KST, 변경 시 PR)
- [x] GitHub repo `ECOS_API_KEY` secret 등록 + workflow_dispatch 테스트 통과
- [x] 노이즈 PR 방지: fetch 스크립트가 데이터 변화 있을 때만 `updatedAt` 갱신 (idempotent)
- [x] `/data/rates/mortgage` (주담대 평균 금리) 페이지
- [x] `/data/rates` 허브 페이지 (live 2개 + coming-soon 2개 카드 그리드)
- [x] GH Actions에 `fetch-mortgage-rate-series.ts` 추가 + sitemap 확장
- [x] Google Search Console + 네이버 서치어드바이저에 `/data/rates`, `/data/rates/mortgage` 색인/수집 요청
- [x] `/data/exchange/usd-krw` (원/달러 환율) 페이지 + `/data/exchange` 허브
- [x] 공용 차트/테이블을 `app/data/_components/`로 이동 + serializable `format={}` 옵션화
- [x] GH Actions에 `fetch-usdkrw-rate-series.ts` 추가
- [x] Google Search Console + 네이버 서치어드바이저에 `/data/exchange`, `/data/exchange/usd-krw` 색인/수집 요청
- [ ] `/data/rates/deposit` (정기예금 금리) 페이지 (현재 coming-soon)
- [ ] `/data/rates/treasury-10y` (국고채 10년) 페이지 (현재 coming-soon)
- [ ] `/data/exchange/jpy-krw` / `/data/exchange/cny-krw` / `/data/exchange/eur-krw` (현재 coming-soon)

---

## 기술 부채

- [ ] 2026년 공휴일 데이터 하드코딩 → 향후 연도 대응 방안 (API 또는 연도별 추가)
- [ ] 환율/금리 데이터 fetch 스크립트의 실제 API 키 설정 및 자동화
- [ ] interest-rates.json, exchange-rates.json fallback 데이터 주기적 업데이트

---

## Phase 2 (미팅 #01~#03 기반)

- [ ] 크롤링 데이터 기반 콘텐츠 (공공 API 데이터 활용)
- [ ] 추가 계산기 검토 (검색 트래픽 분석 후 결정)
