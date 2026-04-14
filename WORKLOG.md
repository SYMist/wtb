# 작업 일지

프로젝트 진행 내용을 일 단위로 기록합니다.

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

### 미완료 (수동 작업 필요)

- Google Search Console 등록 + 사이트맵 제출
- 네이버 서치어드바이저 등록
- Core Web Vitals 점검
- 네이버 블로그 포스팅

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
