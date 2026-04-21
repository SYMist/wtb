# 작업 일지

프로젝트 진행 내용을 일 단위로 기록합니다.

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

### PR

- PR #25 → main 머지 (Phase 2a 데이터 페이지)

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
