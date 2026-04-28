# 작업 일지

프로젝트 진행 내용을 일 단위로 기록합니다.

---

## 2026-04-28 (화)

### 블로그 포스트 4편 추가 (총 8편)

**신규 포스트:**
- `salary-take-home-guide` (guide) — 연봉 실수령액 계산법 완전 정복. 4대보험 공제율, 소득세 흐름, 연봉별 비교표, 절세 팁. `/finance/salary-calculator` CTA
- `compound-interest-power` (finance-tip) — 복리의 마법. 단리 vs 복리, 월 30만원 10/20/30년 시뮬레이션, 72의 법칙, 25세 vs 35세 시작 비교. `/finance/compound-calculator` CTA
- `usd-krw-impact-analysis` (data-analysis) — 원달러 환율 1,400원 시대 생활 영향 총정리. 환율 종류, 자산별 유불리 표, 3대 고점 역사. `/data/exchange/usd-krw` CTA
- `severance-pay-guide` (guide) — 퇴직금 계산법 완전 정복. 1일 평균임금 공식, 근속별 금액 비교표, 퇴직소득세, 중간정산 사유. `/finance/severance-calculator` CTA

**빌드 검증**: 8개 블로그 포스트 static prerender 성공, TypeScript 오류 없음

---

### 데이터 포털 — 환율 3종 + 국고채 10년 페이지 추가

데이터 포털 coming-soon 카드를 모두 live로 전환. 환율 허브 4종 전부 라이브, 금리 허브 4종 전부 라이브.

**신규 fetch 스크립트 4개**
- `fetch-jpykrw-rate-series.ts` — ECOS 731Y004 / 0000002(원/일본엔) × 0000100(평균자료)
- `fetch-cnykrw-rate-series.ts` — ECOS 731Y004 / 0000019(원/중국위안) × 0000100
- `fetch-eurkrw-rate-series.ts` — ECOS 731Y004 / 0000003(원/유로) × 0000100
- `fetch-treasury10y-rate-series.ts` — ECOS 817Y002 / 010210000(국고채 10년)

**신규 placeholder JSON 4개** (`lib/data/`)
- `jpykrw-rate-series.json` — placeholder 최신 938.45원/100엔 (2026-03)
- `cnykrw-rate-series.json` — placeholder 최신 194.45원/위안 (2026-03)
- `eurkrw-rate-series.json` — placeholder 최신 1,532.67원/유로 (2026-03)
- `treasury10y-rate-series.json` — placeholder 최신 2.79% (2026-03)

**신규 페이지 4개 (7-block 템플릿: Hero 4-card / Chart / AdSlot / Narrative / Table / FAQ / CTA / Sources)**
- `/data/exchange/jpy-krw` — 앰버 차트, 엔저 영향 narrative, FAQ 5개
- `/data/exchange/cny-krw` — 레드 차트, 교역국 위안 영향 narrative, FAQ 5개
- `/data/exchange/eur-krw` — 퍼플 차트, ECB 정책 narrative, FAQ 5개
- `/data/rates/treasury-10y` — 시안 차트, 장단기 스프레드 narrative, FAQ 5개

**허브 페이지 업데이트**
- `/data/exchange` — jpy/cny/eur 카드 coming-soon → live, 최신값 표시
- `/data/rates` — treasury-10y 카드 coming-soon → live

**인프라**
- `sitemap.ts` — 4개 URL 추가 (total 데이터 페이지 10개)
- GH Actions `update-ecos-data.yml` — 4개 fetch step 추가, PR body/add-paths 확장

**빌드 검증**
- 10개 데이터 페이지 모두 static prerender 성공
- TypeScript 오류 없음

---

## 2026-04-25 (토) [오후]

### 블로그 콘텐츠 확충 + 데이터 페이지 추가 + AdSense 슬롯 연결 + 기술 부채 정리

오전에 끝난 블로그 MVP 다음으로 전 영역에 걸쳐 후속 작업.

**1. 블로그 포스트 2편 추가** (총 4편)
- `base-rate-mortgage-spread` (data-analysis 카테고리, 비어있던 슬롯 채움)
  - 한국은행 기준금리 26년 시계열 + 주담대 평균 시계열을 비교해 스프레드 패턴/시차/실전 적용 분석
  - `/data/rates/base`, `/data/rates/mortgage` 데이터를 실제 import해 본문에서 동적 인용 (정합성 자동 유지)
- `jeonse-vs-wolse` (finance-tip)
  - 전월세 전환율 공식, 5억 보증금 vs 월세 60만원 시나리오, 6변수 비교, 선택 체크리스트
- `lib/blog/posts.ts` registry에 2개 추가

**2. 데이터 포털 — 정기예금 페이지** (`/data/rates/deposit`)
- ECOS 통계 코드 탐색: 121Y013 / BEABAB2111 (예금은행 정기예금 신규취급액 가중평균)
  - 처음 시도한 121Y002/BEABAA0202는 `INFO-200 해당 데이터 없음` → 메타 조회로 정확한 코드 확보
- `scripts/fetch-deposit-rate-series.ts` 신규 (idempotent 패턴)
- 294 포인트 (2001-09 ~ 2026-02), 최신 2.76%
- mortgage 페이지 패턴 그대로 (Hero 4-card / Chart / Table / Narrative / FAQ / Calculator CTA / Sources)
  - Calculator CTA를 복리 계산기로 연결 (대출 → 복리)
  - 차트 색상 cyan #0891b2로 차별화
- `/data/rates` 허브 카드 4개 중 3개 live (정기예금 추가, 국고채 10년만 coming-soon)
- sitemap에 추가 + GH Actions 워크플로에 fetch step 추가

**3. 블로그 OG 이미지 자동 생성** (`app/blog/[slug]/opengraph-image.tsx`)
- `lib/og-image.tsx`에 `createBlogOgImage` 헬퍼 추가 (indigo 그라데이션 + 카테고리 pill + 제목/요약)
- `generateStaticParams`로 4개 포스트 정적 생성
- 처음에 `generateImageMetadata` 사용 시 페이지당 모든 슬러그 OG URL이 생성되는 버그 → 제거 후 단일 OG 이미지로 정리
- 검증: 200 OK, 123KB PNG

**4. AdSense 개별 슬롯 ID 연결**
- AdSense 콘솔에서 banner / inline / sidebar 3종 광고 단위 생성 (반응형)
- 슬롯 ID:
  - banner: 1122812925
  - inline: 7075871397
  - sidebar: 6430979927
- `components/common/AdSlot.tsx`를 `<ins class="adsbygoogle">` 마크업으로 전환
  - "use client" 클라이언트 컴포넌트로 변경 (push() 호출 필요)
  - useRef로 strict mode double-mount 가드
  - lazyOnload 스크립트와 호환 (스크립트 로드 전 push는 큐에 적재됨)
- 검증: `/data/rates/base`에서 `<ins ... data-ad-slot="7075871397">` 마크업 정상 주입

**5. CalculatorCTA 버튼 색 충돌 수정**
- `prose-blog a {color: indigo; underline}` 스타일이 CTA 내부 Link까지 적용되어 인디고 배경에 인디고 글자
- 글로벌 셀렉터를 `prose-blog :is(p, li, td, blockquote) a`로 한정 (인라인 텍스트 링크에만)

**6. 공휴일 데이터 멀티이어 구조 리팩토링**
- 단일 `HOLIDAYS_2026` 배열 → `HOLIDAYS_BY_YEAR: Record<number, string[]>` dict
- `WorkdayResult`에 `missingHolidayYears` 필드 추가 — 데이터 없는 연도는 weekend/총일수만 정확 계산
- `/date/workday-calculator` 페이지에 amber 배지 워닝 UI 추가
- 새 연도 추가 가이드를 코멘트로 명시 (1줄 추가하면 끝)
- legacy `HOLIDAYS_2026` export 유지 (기존 import 호환)

### 검증 (라이브)

- 신규 블로그 포스트 2개: `/blog/base-rate-mortgage-spread`, `/blog/jeonse-vs-wolse` → 200
- 신규 데이터 페이지: `/data/rates/deposit` → 200
- 블로그 OG 이미지: `/blog/{slug}/opengraph-image` → 200, image/png 123KB
- AdSense 마크업: `<ins class="adsbygoogle">` 정상 주입
- 근무일수 계산기: 2026 연도는 정확, 다른 연도 입력 시 워닝 표시

### 색인 요청 완료

- Google Search Console: 4개 URL 색인 생성 요청 완료
- 네이버 서치어드바이저: 동일 4개 URL 웹페이지 수집 요청 완료
  - `/blog/base-rate-mortgage-spread`, `/blog/jeonse-vs-wolse`, `/data/rates/deposit`, `/data/rates`

---

## 2026-04-25 (토) [오전]

### 블로그 MVP 구현 — `/blog` 라우트 + MDX 파이프라인 + 샘플 포스트 2개

어제 Stitch에서 받은 디자인(DESIGN.md + code.html)을 Next.js 구현으로 이식. 단일 컬럼 720px 에디토리얼 레이아웃, Pretendard, Indigo #4f46e5 액센트를 유지.

**의존성 추가** (`tooly/package.json`):
- `gray-matter` (frontmatter 파싱)
- `next-mdx-remote` v6 (RSC mode)
- `remark-gfm` (테이블, 체크박스, 취소선)
- `rehype-slug` (H2/H3 anchor id)
- `reading-time` (읽는 시간 추정)
- `rehype-autolink-headings`는 빌드 충돌로 제외

**파일 구조**:
- `content/blog/*.mdx` — 포스트 콘텐츠 (frontmatter + MDX body)
- `lib/blog/posts.ts` — `getAllPosts` / `getPostBySlug` / `getPostsByCategory` / `getRelatedPosts` + TOC 자동 추출 + 읽는 시간 계산
- `lib/blog/categories.ts` — 3개 카테고리 (계산기 가이드 / 금융 상식 / 데이터 분석)
- `components/blog/` — 블로그 전용 컴포넌트 9종
- `app/blog/page.tsx` — 리스트
- `app/blog/[slug]/page.tsx` — 본문 (`generateStaticParams`로 SSG)
- `app/blog/category/[category]/page.tsx` — 카테고리 필터

**컴포넌트 9종**:
- `PostCard` — 리스트 카드 (카테고리 pill + 제목 + 2줄 excerpt + 메타 + 썸네일)
- `CategoryChips` — 필터 pill 가로 스크롤
- `TldrBox` — 핵심 요약 박스 (좌측 indigo 보더)
- `TableOfContents` — H2/H3 접힘 목차
- `Callout` — 4 variants (tip/warning/info/important)
- `ComparisonTable` — 제브라 스트라이핑, highlightLastCol 옵션
- `CalculatorCTA` — 다크 박스 CTA (계산기 링크)
- `FaqAccordion` — Q/A `<details>` 아코디언
- `AuthorCard` — 저자 이니셜 아바타 + 소개
- `RelatedPosts` — 3열 그리드
- `ArticleBody` — `next-mdx-remote/rsc`로 MDX 렌더링 + 커스텀 컴포넌트 주입

**프론트매터 스키마**:
```yaml
title / slug / category / excerpt / date / author{name,role,bio} /
thumbnail / tldr[] / faq[{q,a}] / relatedSlugs[]
```

**SEO 구조화 데이터 3종**:
- `Article` (headline, datePublished, author, articleSection, mainEntityOfPage)
- `BreadcrumbList` (홈 → 블로그 → 카테고리 → 포스트)
- `FAQPage` (frontmatter의 faq 배열 → Question/Answer)

**sitemap.ts 확장**: `/blog` (0.8) + 카테고리 3개 (0.6) + 포스트 동적 (0.7, lastModified=post.date)

**빌드 이슈 해결**:
- `next-mdx-remote/rsc`가 JSX 프롭으로 **중첩 배열을 받을 때 prerender 단계에서 stringify 실패** (`Cannot read properties of undefined (reading 'map') at stringify`)
- 해결: ComparisonTable이 `headersJson` / `rowsJson` 문자열 프롭을 받아 `JSON.parse`로 복원하도록 설계. 원본 배열 프롭 방식은 Next.js 16 Turbopack + next-mdx-remote v6 조합에서 호환성 문제
- 5회 build 테스트로 원인 격리 후 API 고정

**검증 결과**:
- `npm run build`: 89페이지 정적 생성 통과 (블로그 2개 포함)
- dev 서버에서 `/blog`, `/blog/{slug}`, `/blog/category/{id}` 모두 HTTP 200
- JSON-LD: Article + BreadcrumbList + FAQPage 모두 주입 확인
- sitemap에 블로그 URL 6개 포함 확인

**샘플 포스트 2개**:
1. `irp-tax-benefit-2026` — 2026년 IRP 세액공제 꿀팁 (카테고리: 금융 상식, FAQ 4개)
2. `mortgage-repayment-methods` — 원리금 균등 vs 원금 균등 (카테고리: 계산기 가이드, FAQ 4개)

### Cloudflare Workers 배포 — MDX 런타임 이슈 해결

빌드는 로컬에서 통과했지만 Workers 배포 후 `/blog/{slug}`만 500 에러. 로그 확인:
```
Failed to load external module next-mdx-remote-bb3b2464f4f590a5/rsc:
Error: No such module "next-mdx-remote-bb3b2464f4f590a5/rsc".
```

`next-mdx-remote/rsc`가 Workers 번들에서 external로 마크되어 런타임 resolve 실패. OpenNext 기본 번들 설정으로는 해결 어려움. `dynamicParams=false` 시도했으나 SSG HTML이 OpenNext assets에 복사되지 않아 404.

**해결 방향 전환**: MDX 런타임 의존성 완전 제거 → **포스트를 TSX 컴포넌트로 작성**.

구현 변경:
- `content/blog/*.mdx` → `content/blog/*.tsx` (각 포스트가 직접 React 컴포넌트)
- `export const meta: PostMeta` + `export default function Content()` 구조
- `lib/blog/posts.ts`를 registry 기반으로 재작성 (`import * as Irp from ...`)
- `ArticleBody.tsx` 제거, page.tsx에서 `<post.Content />` 직접 렌더
- `tooly/content/blog/` 에서 MDX 2개 삭제, TSX 2개로 대체
- 불필요 deps 제거: `gray-matter`, `next-mdx-remote`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `reading-time`
- TOC/readingMinutes는 frontmatter 대신 meta 객체에 수동 명시

결과:
- Workers 배포 후 6개 블로그 URL 전부 HTTP 200:
  - `/blog`, `/blog/irp-tax-benefit-2026`, `/blog/mortgage-repayment-methods`
  - `/blog/category/guide`, `/blog/category/finance-tip`, `/blog/category/data-analysis`
- 라이브에서 TL;DR, 목차, ComparisonTable, Callout, CalculatorCTA, FAQ, 관련글 전부 렌더 확인
- JSON-LD 3종 (Article / BreadcrumbList / FAQPage) 주입 확인
- 번들 크기 축소 (MDX 컴파일러 제거)

**트레이드오프**: MDX의 편의성(frontmatter + markdown) 상실. 하지만:
- 커스텀 컴포넌트(Callout/ComparisonTable/CalculatorCTA) JSX로 자연스럽게 사용 가능
- Workers 런타임 의존성 0
- 빌드 타임 전부 정적 렌더 → CWV 유리
- 향후 포스트 작성 시 `content/blog/{slug}.tsx` + registry 한 줄 추가 방식

### 색인 요청

- Google Search Console: `/blog`, 포스트 2개, 카테고리 3개 (총 6개 URL) 색인 생성 요청 완료
- 네이버 서치어드바이저: 위 6개 URL 웹페이지 수집 요청 완료

### 남은 작업

- 후속 포스트 지속 발행 (월 4~8개 목표)

---

## 2026-04-24 (금)

### 블로그 디자인 Prep — Stitch로 리스트/본문 화면 생성

Phase 2b 다음 우선순위로 블로그 구축 논의. 자체 호스팅 `/blog` 라우트로 결정 (AdSense 수익·도메인 권위 집중·tooly 계산기 연계를 티스토리/네이버보다 우선).

**디자인 방향 합의**:
- SEO + GEO(Generative Engine Optimization) 친화 목적
- 단일 컬럼 720px, Pretendard, Indigo #4f46e5 액센트
- TL;DR 박스 / 목차 / 콜아웃 / 비교 테이블 / FAQ 아코디언 — AI 인용 친화 구조
- 본문 18px 1.75 line-height

**Stitch MCP 연동 시도 (결론: 미완료, 대체 경로로 전환)**:
- 프로젝트 스코프 `.mcp.json` 커밋 (PR #39)
- `stitch-mcp init` 진행 중 다수 이슈 연쇄 발생:
  1. gcloud 미설치 → `brew install --cask google-cloud-sdk`
  2. Apple Silicon에서 심볼릭 링크 미생성 → `/opt/homebrew/share/google-cloud-sdk/path.zsh.inc` source로 해결
  3. init의 `Password:` 프롬프트 3회 실패 후 "Token fetch failed"
  4. 시스템 gcloud로 `application-default login` + `services enable stitch.googleapis.com` + IAM 권한 부여 수행
  5. stitch-mcp가 자체 번들 gcloud SDK(`~/.stitch-mcp/google-cloud-sdk/`)를 사용함을 발견, 해당 SDK로 재로그인
  6. doctor 결과 Stitch API 여전히 403 — stitch-mcp가 "Active Project"를 `gen-lang-client-0314089326` (user의 Gemini API 기본 프로젝트)로 자동 추론하는 것으로 확인
  7. 브라우저에서 stitch.withgoogle.com은 정상 접근 가능 → API는 별도 allowlist/preview 가능성
- **결론**: MCP 연동은 보류, Stitch 웹 UI Export로 전환

**Stitch 웹 UI Export 완료**:
- 동일 프로젝트에 리스트/본문 두 화면 생성 ("Editorial Finance" 디자인 시스템)
- Export 옵션 중 `.zip` 선택 → HTML + 스크린샷 + DESIGN.md 패키지 확보
- `design/` 레포 루트에 저장:
  - `design/stitch_tooly_minimalist_finance_blog.zip`
  - `design/tooly_blog_project_brief.md`
  - `design/stitch_tooly_minimalist_finance_blog/editorial_finance/DESIGN.md` (컬러/타이포/간격 스펙)
  - `design/stitch_tooly_minimalist_finance_blog/tooly_blog_list/` (code.html + screen.png)
  - `design/stitch_tooly_minimalist_finance_blog/tooly_blog_article/` (code.html + screen.png)

**다음 할 일 (2026-04-25 예정)**:
- `/blog` + `/blog/[slug]` + `/blog/category/[cat]` 라우트 구현
- MDX 파이프라인 + 블로그 컴포넌트 세트
- JSON-LD (Article/BreadcrumbList/FAQPage) + sitemap 동적 확장
- 샘플 포스트 1~2개

### PR

- PR #39 → main 머지 (프로젝트 스코프 Stitch MCP 설정)

---

## 2026-04-23 (목)

### Phase 2a 자동화 — ECOS 월 1회 갱신 파이프라인

- **Wrangler secret은 건너뜀**: `/data/rates/base`가 빌드 타임 JSON import 구조라 런타임 키 불필요. GH Actions + GH Secret 조합으로 전환.
- **`fetch-interest-rates.ts` 정비**:
  - `BOK_API_KEY` → `ECOS_API_KEY`로 통일 (legacy 이름 fallback 유지)
  - 하드코딩된 `202601/202612` → 동적 현재월 계산 (최근 24개월 중 마지막 값 사용)
  - baseRate 2.75 fallback → 실제 API 값 2.5로 정상 반영 확인
- **GitHub Actions 워크플로**: `.github/workflows/update-ecos-data.yml`
  - 매월 1일 12:00 KST (03:00 UTC) 실행 + 수동 트리거
  - `fetch-base-rate-series.ts` + `fetch-interest-rates.ts` 연속 실행
  - `peter-evans/create-pull-request@v7`: 변경 있을 때만 PR 자동 생성
  - base=main, branch=`data/ecos-monthly-update`, delete-branch 활성

### 첫 실행 디버깅 (동일일 내)

1. `npm ci` 실패 — `package-lock.json` picomatch 버전 어긋남 → 로컬 `npm install`로 동기화
2. `actions/checkout@v4`, `setup-node@v4` Node 20 deprecation 경고 → v5 + Node 22로 상향
3. `GitHub Actions is not permitted to create or approve pull requests` → `gh api`로 repo 워크플로 권한을 `write + can_approve_pull_request_reviews=true`로 변경
4. 첫 성공 PR(#30)이 데이터 변화 없이 `updatedAt`만 이동 → fetch 스크립트를 idempotent하게 리팩토링 (데이터 실제 변경 시에만 `updatedAt` 갱신), PR #30 close
5. 재실행 검증 → 변화 없음 → PR 미생성 ✅

### PR

- PR #28 → main 머지 (워크플로 추가)
- PR #29 → main 머지 (lock 동기화 + action 버전 상향)
- PR #30 close (노이즈 PR)
- PR #31 → main 머지 (idempotent 갱신)

### Phase 2b — `/data/rates` 허브 + 주담대 페이지

- **공용 컴포넌트 분리**: `app/data/rates/_components/RateChart.tsx`, `RateTable.tsx`
  - `label`, `color`, `interpolation`, `defaultRange` props로 기준금리/주담대 공용화
  - underscore prefix로 라우팅 제외
- **`scripts/fetch-mortgage-rate-series.ts` 신규**: ECOS `121Y006/M/BECBLA0302` (예금은행 주담대 신규취급액 가중평균금리)
  - 2001-09 ~ 2026-02, 294개 월별 포인트, 최신 4.32%
  - 기준 스크립트와 동일한 idempotent 패턴
- **`/data/rates/mortgage` 페이지** (7-block 템플릿)
  - Hero: 현재 금리 + 기준금리 대비 스프레드 카드 (+X.XXp)
  - Chart: 빨간색 선그래프 + monotone interpolation
  - Dataset/FAQPage/BreadcrumbList JSON-LD
  - 대출 계산기로 CTA (`?rate={latest}` 쿼리 프리필)
- **`/data/rates` 허브**: 카드 그리드 4개 (기준금리·주담대 live / 정기예금·국고채10년 coming)
- GH Actions 워크플로에 주담대 fetch 단계 + add-paths 추가
- sitemap.ts에 `/data/rates`, `/data/rates/mortgage` 추가
- PR #33 → main 머지 (Phase 2b)

### 색인 요청

- Google Search Console: `/data/rates`, `/data/rates/mortgage` 색인 생성 요청 완료
- 네이버 서치어드바이저: 위 2개 URL 웹페이지 수집 요청 완료

### Phase 2b 확장 — `/data/exchange` 허브 + 원/달러 페이지

- **`scripts/fetch-usdkrw-rate-series.ts` 신규**: ECOS `731Y004 / 0000001 / 0000100` (원/미국달러 평균자료)
  - 1980-01 ~ 2026-03, 555개 월별 포인트, 최신 1,486.64원
  - 기존 스크립트와 동일한 idempotent 패턴
- **공용 컴포넌트 이동 & 리팩토링**: `app/data/rates/_components/` → `app/data/_components/`
  - 함수 prop(`formatValue`, `formatChange`) → serializable `format={}` 옵션 객체 (RSC 함수 prop 에러 회피)
  - `unit` / `useCommas` / `precision` / `tickPrecision` / `hideTickUnit` / `changeUnit` 지원
  - rates 페이지는 기본값(`%`/`%p`)으로 그대로 동작
- **`/data/exchange/usd-krw` 페이지** (7-block 템플릿)
  - Hero 4-card: 현재 / 전월 대비 / 1년 전 YoY / 장기 평균
  - Chart: 녹색 monotone 라인, y축 tick에 unit 숨김, 툴팁에 `1,486.64원` 포맷
  - Narrative: IMF / GFC / 연준 긴축 국면 언급
  - Dataset / FAQPage / BreadcrumbList JSON-LD
  - CTA: `/convert/currency-converter` 환율 변환기
- **`/data/exchange` 허브**: USD/KRW live + JPY/CNY/EUR coming-soon 카드 4개
- GH Actions 워크플로에 환율 fetch 단계 추가 + add-paths 확장
- sitemap.ts에 `/data/exchange`, `/data/exchange/usd-krw` 추가
- `.open-next/`, `.wrangler/` 빌드 산출물 gitignore
- PR #36 → main 머지

### 색인 요청

- Google Search Console: `/data/exchange`, `/data/exchange/usd-krw` 색인 생성 요청 완료
- 네이버 서치어드바이저: 위 2개 URL 웹페이지 수집 요청 완료

---

## 2026-04-22 (수)

### Phase 2a — 데이터 포털 첫 페이지 구축

tradingeconomics.com 참고해 **계산기 + 데이터 포털 하이브리드** 방향으로 Phase 2를 재정의한 후 첫 페이지 구현.

- **ECOS 기준금리 시계열 fetch**: `scripts/fetch-base-rate-series.ts`
  - 한국은행 ECOS Open API (`722Y001/M/0101000`)
  - 2000-01 ~ 2026-03 월별 315개 포인트 수집
  - max/min/average 통계 계산 후 `lib/data/base-rate-series.json`에 저장
- **`/data/rates/base` 페이지 구현** (7-block 템플릿)
  1. Hero — 현재 2.5%, 전월대비, 역대 최고/최저 4개 지표 카드
  2. Chart — Recharts 선그래프, 1Y/5Y/10Y/ALL 범위 토글 (lazy-load)
  3. Narrative — 현재 금리의 의미, 장기 평균과의 비교
  4. Table — 최근 24개월 + 전체 315개월 토글
  5. FAQ — 금리 결정 구조, 영향, 갱신 주기
  6. Calculator CTA — 대출 / 복리 / 예·적금 계산기 링크
  7. Sources — 한국은행 ECOS 출처 + 면책
- **SEO 구조화 데이터 3종**: Dataset + FAQPage + BreadcrumbList JSON-LD
- sitemap.ts에 `/data/rates/base` 추가 (priority 0.8, monthly)
- Cloudflare Workers 자동 배포 완료 → 라이브 URL 정상 (HTTP 200, 프리렌더)

### 색인 요청

- Google Search Console: `/data/rates/base` URL 검사 → 색인 생성 요청 완료
- 네이버 서치어드바이저: 웹페이지 수집 요청 완료

### PR

- PR #25 → main 머지 (Phase 2a 데이터 페이지)
- PR #26 → main 머지 (WORKLOG)

---

## 2026-04-18 (토)

### 배포 마무리 & 수익화 인프라

- **커스텀 도메인 연결**: https://tooly.deluxo.co.kr (Cloudflare Workers + deluxo 서브도메인)
- **도메인 레퍼런스 일괄 변경**: tooly.kr placeholder → tooly.deluxo.co.kr
  - `app/layout.tsx` metadataBase, `app/sitemap.ts` BASE_URL, `app/robots.ts`, `components/common/JsonLd.tsx`, `lib/og-image.tsx`
- **AdSense 연동**: pub-5716436301710258 (deluxo 도메인 기승인)
  - `public/ads.txt` 업데이트
  - `app/layout.tsx` head에 adsbygoogle.js 스크립트 추가 (auto ads 활성)
- **OpenNext 배포 트러블슈팅**:
  - `@cloudflare/next-on-pages` (Next.js <=15.5.2만 지원) → `@opennextjs/cloudflare`로 전환
  - wrangler dev dependency 추가
  - `wrangler.jsonc` worker 이름 `tooly` → `wtb` (mmist0226 계정 대시보드와 일치)
  - 계정 전환(suyeon.chung → mmist0226) 후 정상 배포
- **Google Search Console 등록**:
  - URL 접두어 속성으로 `https://tooly.deluxo.co.kr/` 추가
  - sitemap.xml 제출 → 상태 "성공"
  - 주요 페이지 URL 검사 도구로 색인 생성 요청

### 네이버 서치어드바이저 등록

- `app/layout.tsx`에 `naver-site-verification` 메타 태그 추가 (Metadata API `verification.other`)
- 소유권 확인 성공 → sitemap.xml 제출 → robots.txt 검증 완료
- 주요 24개 URL 수집 요청 (킬러 계산기 3종 + 카테고리 5개 + 일반 계산기 16개)

### 네이버 블로그 운영 플레이북 작성

- `marketing/naver-blog-playbook.md` 생성
- 네이버 C-Rank/DIA 알고리즘 대응 전략, 포스팅 주제 10선, 마크다운 템플릿, 체크리스트, 4주 발행 스케줄, UTM 측정 가이드 포함
- 실제 블로그 포스팅 발행은 후속 작업으로 분리

### PR

- PR #11~#20 → main 머지 (도메인/AdSense/Search Console/네이버/플레이북)

---

## 2026-04-14 (월)

### SEO 전략 전체 구현 (Phase A/B/C)

**Phase A — 온페이지 SEO:**
- JSON-LD FAQ를 모든 21개 계산기에서 3~5개로 확장
- 5개 카테고리 페이지에 서술형 설명 콘텐츠 + `generateMetadata` 추가
- CategoryInfo에 `description` 필드 추가
- Google Analytics 4 연동 (layout.tsx, 환경변수 `NEXT_PUBLIC_GA_ID`)

**Phase B — 기술적 SEO:**
- Pretendard 웹폰트 CDN 로딩 (preconnect + variable font dynamic subset)
- OG 이미지 자동 생성 (루트 + 5개 카테고리 + 3개 킬러 계산기, `opengraph-image.tsx`)
- WebApplication JSON-LD 스키마 추가 (JsonLd.tsx)
- OG 이미지 공통 생성 함수 (`lib/og-image.tsx`)

**Phase C — 프로그래매틱 SEO:**
- 연봉 구간별 사전 계산 페이지 20개 (`/finance/salary-calculator/[amount]`)
  - 2000만~2억원, 구간별 맥락 콘텐츠 (절세 팁, 세율 안내)
  - generateStaticParams + generateMetadata + canonical 태그
- 대출 금액별 사전 계산 페이지 15개 (`/finance/loan-calculator/[amount]`)
  - 5천만~10억원, 구간별 맥락 콘텐츠 (대출 규제 안내)
  - 상환 방식 3종 비교 테이블
- sitemap.ts에 프로그래매틱 페이지 35개 추가

### 현재 상태

- 총 78개 라우트 (기존 34 + 프로그래매틱 35 + OG 이미지 9)
- TypeScript 빌드 정상
- TODO.md 체크박스 업데이트 완료

**Phase B — 킬러 계산기 SSR 분리:**
- 대출 계산기: `page.tsx` (서버) + `LoanCalculatorClient.tsx` (클라이언트) 분리
- 복리 계산기: `page.tsx` (서버) + `CompoundInterestClient.tsx` (클라이언트) 분리
- `searchParams: Promise<{}>` 패턴으로 서버에서 파라미터 파싱 → 클라이언트에 props 전달
- 연봉 계산기는 이전에 완료 → 킬러 3종 모두 SSR 분리 완료

### Cloudflare Workers 배포

- `@cloudflare/next-on-pages` → Next.js 16 미지원으로 `@opennextjs/cloudflare`로 전환
- `wrangler.jsonc`, `open-next.config.ts` 설정
- `wrangler` dev dependency 추가
- Cloudflare Workers & Pages에서 GitHub 레포(SYMist/wtb) 연결
- 빌드/배포 성공: https://wtb.mmist0226.workers.dev
- PR #6~#10 → main 머지

### 미완료 (수동 작업 필요)

- 주요 21개 페이지 인덱싱 요청 (URL 검사 도구)
- 네이버 서치어드바이저 등록
- Core Web Vitals 점검
- 네이버 블로그 포스팅
- AdSense 개별 광고 슬롯 ID 연결

---

## 2026-04-13 (일)

### 미팅

| # | 주제 | 주요 결정 사항 |
|---|------|---------------|
| 05 | Phase 1.5 계산기 선정 | 건강 3종(BMI, 기초대사량, 칼로리), 날짜 4종(D-Day, 날짜차이, 만나이, 근무일수), 생활 4종(학점, 전기요금, 퍼센트, 속도변환) — 총 11개 |
| 06 | SEO 전략 수립 | 4축 전략(온페이지, 기술적, 프로그래매틱, 오프페이지+네이버), 3단계 로드맵(Phase A/B/C) |

### 개발

- **REQ-03~07 구현 완료** (PR #2 → main 머지)
  - 킬러 계산기 3종: 연봉 실수령액, 주택대출 시뮬레이터, 투자 복리 계산기
  - 일반 계산기 7종: 예적금, 전월세전환, 퇴직금, 양도소득세, 부가가치세, 면적, 환율
  - 카테고리 페이지 5종 (금융, 건강, 단위변환, 날짜, 생활)
  - 법적 페이지: 개인정보처리방침, 데이터 출처
  - SEO: sitemap.ts, robots.ts, JSON-LD FAQ, OG 메타데이터
  - ads.txt 설정

- **대출 계산기 UX 개선** (PR #3 → main 머지)
  - 매매가 입력: `type="number"` → `type="text" inputMode="numeric"` (콤마 포맷, 최소값 제한 제거)
  - 자기자금 비율 → 대출금액 직접 입력으로 변경, 비율은 계산값으로 노출

- **Phase 1.5 구현 완료** (PR #4 → main 머지)
  - 건강 3종: BMI, 기초대사량(해리스-베네딕트/미플린), 칼로리 계산기
  - 날짜 4종: D-Day, 날짜 차이, 만 나이, 근무일수(2026 공휴일 데이터)
  - 생활 4종: 학점(4.3/4.5), 전기요금(누진제), 퍼센트, 속도변환
  - 카테고리 페이지 업데이트 (건강, 날짜, 생활)

### 현재 상태

- 총 21개 계산기, 5개 카테고리, 34개 라우트
- main 브랜치에 모두 머지 완료
- TypeScript 빌드 정상
