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

### 양도세 1줄기 심화 (Avatar `wiki/web/performance.md` 2026-06-02 데이터 기반)

> 실데이터 신호: 네이버 블로그 검색유입 `양도세 12억 초과`(4개 변형, 네이버+다음) → GA `/finance/capital-gains-tax` 진입(전 페이지 중 최장 참여 9초). **쐐기 가설 방향 검증됨**(볼륨은 아직 0). 뜨는 키워드를 더 정조준.

- [x] **양도세 페이지 title/h1/meta 키워드 보강** — 짧은 형 "양도세" + "12억"을 title·h1·레지스트리에 추가. title: `양도소득세(양도세) 계산기 - 1세대1주택 12억 초과 고가주택 안분` (2026-06-02 배포)
- [x] **양도세 페이지 12억 초과 시나리오 프리셋 버튼** — "12억 이하(비과세)/15억 1주택/20억 1주택" 빠른 설정 (2026-06-02 배포)
- [x] **네이버 블로그 양도세 후속 글 발행 완료** — 비교형(12억/15억/20억 양도가별 세금 비교)으로 S1과 차별화. 프리셋 딥링크 CTA 포함 (`marketing/naver-post-capital-gains-by-price.md`, 2026-06-02 발행)
- [x] **인접 갭 = 퇴직소득세, 별도 계산기 대신 퇴직금 페이지 deepen으로 흡수** — severance 페이지에 퇴직소득세 연분연승 구조·근속별 세금 사례 추가(아래 SEO 크롤 정비). 프로그래매틱 양산 지양 원칙 유지

---

## SEO 크롤 정비 (2026-06-07 · PR #70)

> 크롤 예산을 깊이 페이지(양도세·퇴직금)로 집중. thin 페이지는 색인에서 빼고, 살릴 페이지는 deepen.

- [x] **thin 페이지 20개 noindex + sitemap 제외** — 범용 13(bmi·bmr·calorie·age·date-difference·dday·workday·gpa·percent·speed·electricity·area·currency) 영구 / 얕은 금융 7(income-tax·rent-conversion·deposit·loan·salary·compound·vat) 임시. `robots:{index:false,follow:true}` + sitemap NOINDEX_PATHS. 라이브 검증 (2026-06-07)
- [x] **양도세 페이지 정적화** — searchParams 서버읽기 제거로 `ƒ`(no-store)→`○`(static), 딥링크는 클라이언트 useEffect. `cache-control: s-maxage` 확인 (2026-06-07)
- [x] **퇴직금(severance) deepen — 색인 유지** — 시나리오 h3 5개(계산순서/연분연승/근속별 급감(3천만 3년 137만 vs 12년 5만)/중간정산/DB·DC) + FAQ 3→7 + 내부링크(↔양도세 ↔연봉). 라이브 검증 (2026-06-07)
- [x] **퇴직금 정적화** — 양도세와 동일하게 `ƒ`(no-store)→`○`(static), 딥링크 클라이언트 useEffect. `s-maxage` 확인 (2026-06-16, PR #72)
- [x] **sitemap noindex 1:1 제외 검증** — 계산기 20개 모두 제외 정상. bmi/dday/compound "잔존"은 substring 겹친 블로그 가이드 글(`/blog/*-guide`, 색인 유지 대상)로 오탐. 코드 변경 불필요. → **GSC 사이트맵 재제출** 권장(구 캐시 갱신) (2026-06-16)
- [ ] **임시 noindex 7개 deepen 후 해제** — 검색유입 신호 있는 것부터(예: rent-conversion=`월세 115만원` 유입). 양도세·퇴직금을 모델로

---

## 네이버→Tooly 전환 누수 수정 (2026-06-18 · 양도세 한정)

> 직전 진단(Avatar `raw/web/2026-06-17_*`): 네이버 피더 주 90~170(91% 고의도) → Tooly 도달 주 ~3 = **97%+ 누수**. 구글 색인(~7/14 판정)과 무관하게 지금 살아있는 유일한 의도 트래픽 통로. **전환 개선안 ①② 실행·배포 완료**(양도세 1줄기 한정).

- [x] **① 착지 수정 — 딥링크 결과 상단 노출** — 양도세 페이지에 프리셋/utm 딥링크 도착 시 입력칸 위에 결과 요약(총세금·세후/비과세) 노출. 모바일 스크롤 없이 보상 노출, 직접방문 UX 불변. 프리뷰 검증 + 프로덕션 라이브 확인 (커밋 `86312d9`, `wtb` v`51a3528e`, 2026-06-18)
- [x] **② 양도세 블로그 2편 개인화훅 retrofit** — 예시 직후(궁금증 피크)에 "본인 취득가·보유·거주 조합으로" 훅 삽입. 링크 2개 유지(저품질 게이트)·시나리오 프리셋 딥링크로 보강(본문 숫자 일치 검증). 사용자 직접 재발행 완료 (2026-06-18)
- [ ] **효과 관찰 후 표준화** — 양도세에서 전환 효과 확인되면 개인화훅을 플레이북·`naver-post-draft` 스킬에 표준화 + 착지 수정을 전 계산기로 확산 (현재 의도적 보류)
- [ ] **(잠재 버그) 온페이지 "20억 1주택" 프리셋 버튼 취득가 12억 → by-price 글 가정(취득 10억) 불일치** — 그 버튼 스샷이 본문 표와 어긋남. 직접방문 UX라 이번 미수정, 추후 정리 후보

---

## 아파트 점수화 퍼널 (2026-06-25 · 신규 독립 줄기)

> Avatar `wiki/web/apartment-scoring-funnel.md` "실행 스펙" 발주. 인스타→방법론 엑셀→**계산기**(인터랙티브) 퍼널의 종착면. 기존 양도세 줄기와 독립(색인 무관·referral 채널). 산식 출처 `raw/web/apartment-scoring-logic.md`.

- [x] **`/finance/apartment-score` 계산기 빌드·배포** — 5기준 가중점수(거리/면적/컨디션/세대수/연식), 산식 그대로(상수 객체 1곳), 연식 현재연도 동적. 입력폼+측정 프로토콜 카피, 결과(기여 길이 바·가중치 숫자 비노출), 저장 순위표(localStorage, 같은 가중치 세트 재계산), 나가는 다리(저장/공유+워터마크/애드센스/랜딩), GA 계측(arrival/complete/bridge_*). 정적 프리렌더(`○`). 회귀 A유형 60.5/75 라이브 검증. Cloudflare 배포 라이브 200 (커밋 대기, `wtb` v`023466fd`, 2026-06-25)
- [x] **가중치 = 1~5 우선순위 모델** — 자유 슬라이더→우선순위 재배열(↑↓). 위에서부터 5·4·3·2·1점 자동 배분 = 항상 1~5 순열(서로 다른 값·각 최대 5점), 만점 75 고정. (사용자 요구, 2026-06-25)
- [x] **`/finance/apartment-loan` 대출 감당 시뮬 빌드·배포** — 2번째 도구("감당되나"). 원리금균등+2026 규제(생애최초 LTV70%·차등한도·DSR40%·스트레스 1.5%, `LOAN_REGULATION` 상수 1곳+"2026.6" 라벨). DSR 분모=**세전 연소득**(세후월×12 아님). 변동금리 스트레스 재판정, 불가 시 "목돈 얼마면" 힌트, 🔒 신뢰 카피(기기 밖 전송 없음), 금리 사용자 입력(플레이스홀더만). **점수 계산기와 상호 다리**(↔`apartment_bridge_loan`/`aptloan_bridge_score`). GA `aptloan_*`. 정적 `○`. 회귀 8억 케이스(원리금₩2,319,352·LTV60%·DSR26.3%·가능) 라이브 검증. Cloudflare 라이브 200 (`wtb` v`1e0b3e2d`, 2026-06-25)
- [ ] **랜딩 보조 링크 URL 연결** — 본인 제작 랜딩(볼트 밖) URL 확보 시 두 페이지의 `LANDING_URL` 상수 채우면 링크+`*_bridge_landing` 이벤트 노출 (점수·대출 공통)
- [ ] **registry/sitemap 편입 여부** — 두 페이지 현재 의도적 미편입(독립 줄기·7/14 양도세 sitemap 흐름과 비격리). 인스타 유입 안정화 후 재검토
- [ ] [Avatar] (유입 발생 후) GA 통합 깔때기로 약한 고리 #1(도달률) + 두 도구 상호 다리 통과율 판정

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

## 이긴 시계열 페이지 과거시점 롱테일 최적화 (2026-07-15 · Avatar 발주)

> 근거: `wiki/web/performance.md` "📋 실행 스펙"(7/14 판정: 데이터포털 시계열이 양도세 창끝을 이김 / 7/15 판정: 회수는 되나 저단가). 급소 = `RateTable.tsx`가 `"use client"` + 기본 24행만 SSR(`slice(0,24)`) → 승리 드라이버 "2020년 5월 기준금리"(125클릭)가 색인 HTML에 없는 채로 랭크 중. 프로그래매틱 양산 아님(기존 페이지 심화).

- [x] **변경 1 — RateTable.tsx 전체 시계열 SSR 노출**: 24행 slice 제거, 전 행 항상 렌더 + CSS로 접기(progressive enhancement). base/mortgage/deposit/treasury-10y/exchange 공유 자동 적용
- [x] **변경 2 — base/mortgage 연도별 프로즈 블록**: series JSON에서 연 단위 서버 렌더 생성("{연도}년 기준금리는 X%로 시작해…"), 하드코딩 금지
- [x] **변경 3 — Block 6 CTA GA4 측정 훅**: `cta_click` 이벤트(페이지·타깃계산기 라벨) — 회수 저단가 판정(7/15)의 다음 데이터(시계열→계산기 전환 계측)
- [ ] **판정선(~2026-08-05)**: GSC에서 base·mortgage "{연도}년…" 과거시점 쿼리 노출·클릭·CTR 증가 확인. 안 늘면 SSR/프로즈가 레버 아님 → 신설 시계열 기회 풀로 회귀

---

## 신선도 전면화 + 스니펫 수리 + CTA 재배치 (2026-08-05 · Avatar 발주)

> 근거: `wiki/web/performance.md` "📋 실행 스펙"(8/05 판정 ③ CTA 노출률 10% / ⑤ 스니펫 층 누수 + 경쟁자 calcscoop 진입, 단 17일째 스테일). 대상 = `/data/rates/base` 우선, 검증되면 mortgage 동일 적용. 프로그래매틱 양산 아님(기존 페이지 심화).

- [x] **변경 ① 연도별 평균 요약표**: Block 4(월별 319행) 앞에 27행짜리 짧은 표 신설(연도/연평균/전년비) — 스니펫이 통째로 인용할 표를 준다. `lib/data/yearly-rate-average.ts`에서 series 원천 계산(하드코딩 금지), 2026은 부분연도(7개월) 주석
- [x] **변경 ② 인라인 CTA**: Block 3 내러티브 끝에 프로즈 안 링크(예·적금 계산기) 추가 — 하단 CTA는 스크롤 도달률이 낮다. `position: inline`/`bottom`으로 GA4 분해
- [x] **변경 ③ 신선도 전면화**: `updatedAt`(데이터 최종 변경일)과 `checkedAt`(원천 확인일) 분리 — `saveSeries`가 매 run `checkedAt` 기록, Hero에 "데이터 기준 {기준월} · ECOS 확인 {일자}" 노출. schema.org `dateModified`는 `updatedAt` 유지
- [x] **checkedAt 최초 채움**: `workflow_dispatch` 수동 트리거(run `31015086373`, 봇 커밋 `36ffdab`) — 가드 11/11 통과, base `dataChanged=false`·`preserved=0`(ECOS 2026-07 2.75% 유지). 라이브 Hero에 `ECOS 확인 2026-08-05` 노출 확인 (2026-08-05)
- [ ] **판정선(~2026-09-05)**: 서치어드바이저 `2020년 5월 기준금리` CTR 2.8%→4.0% 미만이면 스니펫 레버 기각 / `cta_click` 5건 미만이면 배치 가설도 기각(회수는 시계열로 안 됨 확정)

---

## base 스니펫 수리(과거시점 프로즈) + mortgage 동일 적용 (2026-08-08 · Avatar 발주)

> 근거: `wiki/web/performance.md` "📋 실행 스펙"(8/08). 네이버 SERP는 meta description을 무시하고 본문 최상단 텍스트를 DOM 순서대로 긁는다. 기존 base 스니펫이 "금융통화위원회가 결정하는… + 데이터 기준 2026년 7월"이라 과거시점 쿼리(`2020년 5월 기준금리`, 클릭 35/월)에 오답 신호를 줬고 CTR이 4.9%→2.8%→2.1%로 하락 중. 계산식 변경 없음.

- [x] **변경 ① base Hero 프로즈 교체**: 첫 문단이 "과거 시점 값도 여기 있다"를 실제 값과 함께 말하도록 교체 — `{시작연도}년 이후 … 역대 최저 2020년 5월 0.50%, 역대 최고 2000년 10월 5.25% 등 과거 시점 값을 모두 포함합니다.` 값은 `stats.min`/`stats.max`에서 파생(하드코딩 금지), 단일 텍스트 노드로 렌더
- [x] **변경 ② 신선도 배지 이동**: Hero 프로즈 바로 뒤 → 통계카드 그리드 **뒤**로. 삭제 아님, DOM 순서만. 문구·값 불변
- [x] **변경 ③ mortgage 동일 적용**(8/05 "mortgage 복제" 합류): 과거시점 프로즈(역대 최저 2020년 8월 2.39% / 최고 2008년 10월 7.58%) + `checkedAt` 신선도 배지(통계카드 뒤) + 연도별 평균표 26행 + 인라인 CTA(`position: inline`, 하단 CTA엔 `bottom` 부여)
- [ ] **판정선(빠른 갈래 ~2026-08-22)**: 서치어드바이저 SERP 스니펫에 `2020년 5월 0.50%`가 안 뜨면 스니펫 레버 즉시 기각 / **느린 갈래 ~2026-09-08**: `2020년 5월 기준금리` CTR 2.1%→4.0%

---

## 환율 시점 비교·환산 페이지 신설 (2026-08-08 · Avatar 발주)

> 근거: `wiki/web/performance.md` "📋 실행 스펙 — 환율 시점 비교·환산 페이지 신설". 우리은행·지표누리가 in-SERP 표를 이미 렌더하므로 **표로는 못 이긴다**. 싸울 지점 = ① 두 시점 비교 ② 그때 금액 → 지금 가치 환산 ③ 1980년 이후 깊이. 페이지는 **1개**, 임의 조합은 같은 URL의 쿼리 파라미터(조합 URL 양산 금지).

- [x] **계산 코어 분리 + 검산 3겹 테스트**: `lib/data/exchange-compare.ts` / `.test.ts` 24개 통과 (`npm run test:exchange-compare`). 급소 2개를 테스트로 고정 — ⓐ JPY는 100엔당 표기라 환산에 `unit=100` 정규화(USD 코드로 처리 시 정확히 100배 틀린다는 것까지 테스트) ⓑ 구매력 변화율은 변화율의 부호 반전이 **아님**(+34.70% ↔ −25.76%, `notStrictEqual`로 오답 명시) (2026-08-08)
- [x] **`/data/exchange/compare` 신설**: 서버 컴포넌트 + `?cur=&from=&to=` searchParams SSR(`ƒ`). GET form(클라 상태 아님)이라 결과 URL이 공유·색인 가능. Hero는 8/08 패턴(값 포함 프로즈 먼저, 신선도 배지는 통계카드 뒤). 외화 고정·원화 고정 2결과 카드 + "이 결과를 읽는 법" 프로즈 (2026-08-08)
- [x] **통화별 시작월 클램프 + 화면 표시**: USD·JPY 1980-01 / EUR 1999-01 / CNY 2006-01. 범위 밖 요청은 보정하되 **조용히 넘기지 않고** amber 문구로 명시 ("요청하신 1990년 1월은 … 2006년 1월로 보정했습니다"). 라이브 확인 (2026-08-08)
- [x] **고정 6프리셋 SSR 블록**: 전년 동월 / 5년 전 / 10년 전 / 코로나 저점(2020년 중 최저월) / 금융위기(2009-03) / 역대 최고월(`stats.max`) — 날짜 전부 데이터 파생, 각 블록에 딥링크 (2026-08-08)
- [x] **배선**: sitemap 4URL(통화별 canonical 1개씩, 조합 URL 미등록) + `/data/exchange` 허브 프로모 + 4종 시계열 페이지 하단 상호 링크 + `RateChart`·`YearlyAverageTable` 재사용 (2026-08-08)
- [x] **계측**: 인라인/하단 CTA → `/convert/currency-converter` (`cta_click`, `position: inline|bottom`, `page: exchange_compare`) + `compare_run`(cur/from/to/source). 라이브 페이로드 확인 (2026-08-08)
- [ ] **판정선(~2026-08-29)**: GSC/서치어드바이저에서 `2016년 환율`·`10년 전 달러 환율`류 두 시점 쿼리 노출 발생 여부. 노출 0이면 "비교 축" 자체가 검색 수요 없는 것 → 환율 신규 투자 중단하고 금리 줄기로 회귀 / 노출 뜨면 프리셋 문구를 실쿼리에 맞춰 재조정
- [ ] **GSC 색인 요청**: `/data/exchange/compare` 4개 canonical URL 제출

---

## gtag shim + 블로그 회수 계측·utm 오염 제거 (2026-08-11 · Avatar 발주)

> 근거: `wiki/web/performance.md` "📋 실행 스펙 — gtag shim + 블로그 회수 계측·utm 오염 제거". 유형 = **③수리**(기존 표면이 제대로 작동하게 됨) → 수요 게이트 면제. 계산식 변경 없음 → 검산 3겹 해당 없음.
> 급소: ⓐ 7/22 `f47c264`가 고친 건 gtag **로드 시점**이지 `trackEvent`의 **무음 드롭** 자체가 아니었다 ⓑ 블로그 회수 동선(`CalculatorCTA`, 12개 글)이 GA 이벤트를 아예 안 쐈다 ⓒ 내부 CTA href의 utm이 GA 세션 소스를 덮어써 유입 채널 통계를 오염시켰다.

- [x] **변경① gtag shim `<head>` 인라인**: `dataLayer`/`gtag` 정의를 `<head>` 평문 인라인 `<script>`로 주입 → `window.gtag` 항상 존재, 로드 전 이벤트는 dataLayer 큐잉 후 재생. **무음 드롭 창 0**. `gtag.js` src·`ga4-init`은 `afterInteractive` 그대로(로드 성능 회귀 없음). ⚠️ 스펙의 `next/script strategy="beforeInteractive"`는 **쓰지 않았다** — Next 16 app router는 인라인 beforeInteractive를 `self.__next_s` 큐로 감싸 Next 런타임이 실행하므로 `<head>` 동기 실행이 아니고, 완료기준(“gtag.js보다 먼저 정의”)을 못 채운다 (2026-08-11)
- [x] **변경② `CalculatorCTA` 클릭 계측**: 버튼만 `components/blog/CalculatorCTAButton.tsx`(클라)로 분리 — 컴포넌트 전체를 `"use client"`로 만들지 않아 **12개 글 SSG(`●`) 유지**. 이벤트는 기존 스키마 합류 `cta_click` + `page`(글 slug, `meta.slug` 주입) / `position: "blog_cta"`. 16개 호출부 전부 주입 (2026-08-11)
- [x] **변경③ 내부 링크 utm 제거**: 4개 글 7곳(electricity·dday·income-tax·bmi) href에서 `?utm_source=naver_blog&…` 쿼리스트링 전체 제거. `grep -rn "utm_source" content/blog/` = **0건**. ⚠️ 네이버 블로그(tooly181) 외부 게시글 링크는 미변경(거기선 utm이 정상 용도) (2026-08-11)
- [x] **라이브 검증 완료**: Cloudflare 배포 `wtb` v`96ff39b0` (2026-08-11). 라이브 `tooly.deluxo.co.kr`에서 ⓐ 블로그 글 `<head>`에 shim 존재(offset 3126/head 3449) ⓑ CTA href `/life/electricity-calculator` — utm 0건, 서버 렌더 유지 ⓒ 클릭 → `["event","cta_click",{page:"electricity-bill-guide",position:"blog_cta"}]` 발화. **급소 ⓐ 실측 확정** — `/data/exchange/compare`에서 `compare_run`이 dataLayer **인덱스 0**, `gtag('js')`·`config`보다 **앞**에 들어갔다 = shim 없으면 그 시점 `window.gtag`가 undefined라 조용히 버려졌을 이벤트. 로컬·라이브 동일 재현 (2026-08-11)
- [x] **판정선(8/14 실행, 4일 앞당김)**: `cta_click` 🟢 서버 도달 / `compare_run` 🔴 **4회 시도 전부 0**. → 아래 8/14 스펙으로 이어짐
- [ ] **판정선(9/08 최종판정 합류)**: `page`×`position` 분해에 블로그 축 포함. **전기 글 클릭 60이 계산기로 얼마나 넘어가는가** = "블로그가 회수면으로 쓸모 있는가"의 첫 실측. 전환이 보이면 **CTA 위치 이동이 다음 발주**(base와 동형 처방), 0에 가까우면 블로그 회수 경로 자체를 접는다
- ⚠️ **CTA 위치 이동은 이번 스코프 밖.** base는 `scroll` 도달 10.2% 실측이 있어 옮긴 것이고 블로그는 데이터가 0이다. 계측 먼저, 위치는 데이터 보고. (급소 = "만든 것이 아무도 안 보는 곳에 있음" 패턴 8회차 — `electricity-bill-guide.tsx:256`은 269줄 중 95% 지점)
- ⚠️ **확인 전까지 `compare_run` 0·`cta_click` 0을 수요 부재로 읽지 말 것** — 발화 0은 계측 사고지 가설 실패가 아니다
- 🔻 **자기정정(8/14)**: 위 "라이브 검증 완료" 항목의 *"급소 ⓐ 실측 확정 / 무음 드롭 창 0"* 은 **과장**이었다. `compare_run` 인덱스 0은 "큐에 들어갔다"(ⓐ 해소) **이자** "config보다 앞이다"(ⓑ 잔존)인데 앞의 해석만 취했다. 같은 관찰이 실은 남은 절반의 증거였다. → 8/14 스펙에서 ⓑ 수리

---

## gtag `js`/`config`를 `<head>`로 이전 (2026-08-14 · Avatar 발주)

> 근거: `wiki/web/performance.md` "📋 실행 스펙 — gtag `js`/`config`를 `<head>`로 이전". 유형 = **③수리** → 게이트 면제. **실패 ⓑ(config 전 큐잉 폐기) 전용** — ⓐ(무음 드롭)는 8/11 `6740b77`로 이미 닫혔다.
> 급소: gtag.js는 `dataLayer`를 **순서대로** 처리하고 **`config`보다 앞선 이벤트는 보낼 대상 태그가 없어 버린다**. `ga4-init`이 `afterInteractive`(하이드레이션 이후)라, 하이드레이션 **시점**에 도는 마운트 effect(`CompareRunTracker`)가 config보다 먼저 큐잉돼 폐기됐다. 클릭 기반 `cta_click`만 살아남은 이유 = 사람 손이 느려서.

- [x] **변경① `<head>` 인라인을 GA4 표준 스니펫 전체로 확장**: `gtag('js',new Date());gtag('config',GA_ID);` 추가. 파싱 시점 동기 실행이라 어떤 마운트 effect보다 항상 앞선다 (2026-08-14)
- [x] **변경② `<Script id="ga4-init">` 삭제**: `gtag.js` src(`afterInteractive`)는 유지 — 늦게 로드돼도 `dataLayer`를 순서대로 재생하므로 `js → config → event` 보장. head와 양쪽에 config를 두면 **`page_view` 이중계수**라 반드시 제거 (2026-08-14)
- [x] **변경③ 곁다리 404**: `compound-interest-power` CTA가 `/finance/compound-calculator`(404)로 향했다 → `/finance/compound-interest`(200). 레포 전수 grep 1곳. ⚠️ `WORKLOG.md` 2곳에도 옛 경로가 있으나 **과거 작업 기록이라 미변경** (2026-08-14)
- [x] **금지 처방 준수**: `CompareRunTracker`에 지연 훅(`setTimeout`·`requestIdleCallback`) **안 씀** — 레이스를 타이밍으로 덮는 재발 구조. 순서를 구조로 보장. `beforeInteractive`도 안 씀(8/11 실측 교훈)
- [x] **완료기준 1·2·3·5·6 통과**: 커밋 `19d1365`, **`origin/main` push 완료**(`git status -sb` 동기 — 라이브 배포만으로 완료 채점 금지 규칙 준수), Cloudflare `wtb` v`d43f4d98`. 라이브 ⓵ `config`가 `</head>`보다 앞(2425 < 2697) ⓶ `ga4-init` 잔존 **0** ⓷ dataLayer 순서 `0:js · 1:config · 2:compare_run` ⓹ `config` 1회·`page_view` collect 정확히 1건(이중계수 없음) (2026-08-14)
- [x] **⭐ collect 실물 포착**: 라이브 USD compare 방문에서 **`en=compare_run&_ee=1&ep.page=exchange_compare&ep.cur=usd&…&tid=G-3FEVQE9CED`** 요청이 브라우저를 실제로 떠났다. 8/14 판정에서 4회 전부 실패했던 그 이벤트 (2026-08-14)
- [x] **🟢 완료기준 4 통과 — 판정 종결(2026-08-14 당일)**: GA4 실시간 "이벤트 이름별 이벤트 수"에 **`compare_run` 1** / `page_view` 1 / `session_start` 1. 8/14 오전 판정에서 4회 시도 전부 0이던 이벤트가 배포 후 첫 방문에 도달. **`page_view`가 1이라 기준 5(이중계수 없음)도 GA4 쪽에서 교차확인**(내 collect 카운트와 독립). → `compare_run` 계측 사고 **종결**, 8/29·9/08 판정에서 정상 데이터로 사용
- ~~판정 갈래(기각 시): `CompareRunTracker` 미마운트 의심~~ — 통과로 불발
- **계측 영향**: `compare_run` 0을 수요 부재로 읽는 창은 **이 배포(8/14) 시점에 닫힌다**. 그 이전 구간(8/08~8/14)의 `compare_run` 0은 **전부 계측 사고로 판정 제외**. 9/08 `cta_click` 분해는 영향 없음(클릭 기반이라 이미 도달 중)

---

## sitemap NOINDEX 만료 게이트 제거 (2026-08-21 · Avatar 발주)

> 근거: `wiki/web/apartment-scoring-funnel.md` "실행 스펙 — NOINDEX 만료 게이트 제거". 유형 = **정합성 수리**(배팅 아님) → 판정선 없음. 6/30 「동결 처리(2단 분리)」가 *"7/14 색인 판정 후 제거"*로 예약해둔 만료 동작의 집행. 6/30~8/21 handoff 6회 이월된 캐비엇을 닫는다.
> 급소: sitemap은 두 아파트 경로를 제외 중인데 두 페이지 robots 메타는 `index, follow` — **불일치**. 게이트 목적(양도세 색인 실험 무오염)은 7/14로 소멸했으므로 robots 쪽에 맞춘다.

- [x] **변경 — `NOINDEX_PATHS` 2줄 삭제**: `app/sitemap.ts`에서 `/finance/apartment-loan`·`/finance/apartment-score` 제거. **파일 1개, 2줄이 전부.** layout robots 무수정(`index, follow`가 맞는 값) · 레지스트리(`lib/data/calculators.ts`) 무수정(6/30 등록분 유지) · 나머지 20개(범용 13 + 얕은 금융 7)는 5/30 "범용 계산기❌" 결정의 실행체라 그대로 (2026-08-21)
- [x] **완료기준 3개 전부 통과 (라이브 실측)**: 커밋 `a1c8dbe`, **`origin/main` push 완료**, Cloudflare `wtb` v`562e19c6`. ⓵ `curl /sitemap.xml | grep -c apartment` = **2** ⓶ loc 총계 **39 → 41**(다른 경로 유실 0) ⓷ 두 페이지 robots 메타 **여전히 `index, follow`** ← 양쪽 정합 확인이 이번 수리의 핵심 (2026-08-21)
- [ ] **곁다리 측정(9/08 세션 · 판정 아님)**: 서치어드바이저 웹문서(URL별) 표에 두 경로 노출이 잡히는가. **0이어도 기각 근거로 쓰지 않는다** — 수요 판정이 아니라 색인 가능 여부 확인
- [ ] **후속(별도 발주)**: 대출 시뮬 검색 SEO 보강 — `주택대출계산기`·`DSR 계산기` 의도 + 2026 규제·부부합산 차별점 롱테일 조준(새 페이지 양산 X)

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
