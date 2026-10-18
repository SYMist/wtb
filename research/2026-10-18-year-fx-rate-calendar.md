# 연도 환율·결정일 기준금리 구현 검증

갱신: 2026-10-18 · 구현 브랜치: `codex-year-fx-rate-calendar` · 운영 반영: `main`

## 범위

기존 `/data/exchange/eur-krw` 한 경로에 연도 조회를 추가하고, `/data/rates/base`에 일자 유효 금리와 월중 공식 변경을 추가했다. 별도 연도 URL·sitemap 항목은 만들지 않았다. 10/15 환율 견적, 전체 EUR 이력·기존 비교 링크, 기준금리 월말 ECOS 조회와 월간 갱신 흐름을 유지한다.

## 연도 환율

- 원천은 기존 `lib/data/eurkrw-rate-series.json`: 한국은행 ECOS 731Y004, 원/유로 0000003 × 평균자료 0000100, 1유로당 원화 월평균이다.
- 연도 선택은 `?year=YYYY`로 서버에서 읽어 선택값·연도 제목·요약·차트·월별 상세표를 SSR한다. canonical은 기존 `/data/exchange/eur-krw`를 유지한다.
- 연도 평균은 실제 관측된 월평균 값들의 단순 산술평균이다. 2023년 전체 12개 값을 독립 계산하면 1,412.3175원(표시 1,412.32원)이며, 최고는 2023-04 1,446.41원, 최저는 2023-01 1,342.37원이다. 동률이 있으면 해당 월 모두 표시한다.
- 전년 비교는 같은 월이 모두 존재하는 동기간만 계산한다. 2023년은 전년 12개월 평균 1,357.72원 대비 약 +54.60원이다. 2026년은 1~9월 9개월만 수록되어 전년 1~9월과 비교한다. 일별 관측값 가중 연평균이나 은행 고시 일별 최고·최저로 부르지 않는다.
- 선택한 연도의 첫 달·마지막 달을 기존 환율 비교 경로로 연결한다. 자동 렌더·딥링크·새로고침은 조회 완료 이벤트를 만들지 않는다.

## 결정일 금리

- 공식 현재 변경 이력 원문: [한국은행 기준금리 추이](https://www.bok.or.kr/portal/singl/baseRate/list.do?menuNo=200677). 2026-10-18 직접 수신한 HTML 표 62행을 `tooly/lib/data/base-rate-decisions.json`에 저장했다. 원문은 1999-05-06~2026-08-27을 수록하고 최신 변경은 2026-08-27 3.00%다. 확인일은 2026-10-18이다.
- 원문 주석은 2008년 2월까지 콜금리 목표, 2008년 3월부터 한국은행 기준금리라고 명시한다. 이 분류는 각 조회일 기준으로 하며 제도 전환일을 변경 사건으로 추가하지 않았다.
- 유효 조회는 최초 수록 변경일부터 원문 확인일까지다. 확인일 뒤 날짜는 미래·미확인 범위로 거절한다. 선택일 값은 해당 날짜까지의 마지막 공식 변경행으로 정하고, 선택 월에는 공식 변경행 모두와 직전 금리·변화폭을 표시한다.
- 경계 검산: 2008-10-08 5.25%, 10-09 5.00%, 10-26 5.00%, 10-27 4.25%; 2020-05-27 0.75%, 05-28 0.50%. 원문의 2008-10-08은 실제 변경행이 아니고 2008-08-07 5.25%가 유지된 조회일이다. 2008년 10월 실제 변경행 2개는 모두 별도 표시한다.
- 수집기는 기존 월간 ECOS 갱신 workflow에 추가했다. 공식 원문 표/제도 주석, 정렬·중복·동일 금리행·대표 경계값을 검사한다. 이전 snapshot의 행 누락/값 변경 또는 최신일 후퇴가 감지되면 파일을 덮지 않고 실패한다.

## SSR·모바일·계측

- `?year=2023` SSR에서 선택 연도 제목, 12행, 평균·극값·비교 문구가 HTML에 들어간다. `?date=2020-05-27` SSR에서 유효 0.75%가 들어간다. canonical은 기존 경로에 유지한다. 유효/무효 연도, 범위 밖 날짜, 2008·2020 경계, 확인일 뒤 요청을 확인했다.
- Avatar 독립 검수와 IAB 확인: 실제 `innerWidth=390`, `innerHeight=844`. 연도 이동 뒤 선택값과 제목이 맞고 브라우저 뒤로가기도 다음 렌더에서 동기화된다. 페이지 가로 `scrollWidth`는 광고 슬롯 안 숨은 iframe 폭을 제한한 뒤 390px이다. 재현 URL: `http://127.0.0.1:3000/data/exchange/eur-krw?year=2023`, `http://127.0.0.1:3000/data/rates/base?date=2020-05-27`.
- 새 폼은 명시 제출 때만 `eur_year_lookup_submit` / `base_rate_date_lookup_submit`를 보내고, 이전·다음 연도 링크는 클릭 때 `eur_year_navigate`를 보낸다. 고정 payload는 `{page: "exchange_eur_krw", action_origin: "year_lookup"}`, `{page: "exchange_eur_krw", action_origin: "year_navigation"}`, `{page: "rates_base", action_origin: "decision_date_lookup"}`이며 조회 연도·일자, 월, 금액·견적 원문을 event params에 넣지 않는다. SSR·딥링크·새로고침은 직접행동 이벤트를 만들지 않는 코드 경로다.
- 로컬 페이지는 `G-LOCALTEST`로 띄웠다. DOM에는 테스트 ID 초기화 코드가 있었지만 로컬 직접 제출·네트워크 요청·GA4 수신은 검사하지 않았다. CUA 읽기 문맥의 `window.gtag`/`window.dataLayer` 부재만으로 페이지 초기화 실패를 추론하지 않았다.

## 운영 반영 및 QA

- 최신 시작 `origin/main` `90c54536d814785d82936211121d3057d73c8c9c`에 기능 브랜치를 일반 merge commit으로 통합했다. 구현 앱 코드는 main commit `9fd3556ec44b82be95028c17dc0d67f5108c2d75`에 포함됐다. Cloudflare Workers Builds ID `9e1dfd7c-17aa-41f1-a0ca-ce121ea89a8e`가 성공했고, Worker `wtb` version `197b6ae4-e2e9-4062-bfd1-705c1bb915c9`가 2026-10-18 05:59:12 UTC (14:59:12 KST)에 100% 배포됐다.
- 운영 SSR: `/data/exchange/eur-krw?year=2023`에 12개월, 1,412.32원, 1,446.41원, 1,342.37원과 전년 동기간 +54.6원을 확인했다. `/data/rates/base?date=2008-10-27`은 4.25%와 10월 9일·27일 두 변경을, 2020-05-27/28은 0.75%/0.50%를 반환했다. 기존 `?month=2020-05`의 0.50%·현재 대비 +2.50%p, 기본 화면, 무효 연도·날짜, 확인일 이후 날짜 안내를 확인했다. 모든 query canonical은 기존 페이지 경로에 유지된다.
- 실제 IAB viewport 390×844에서 두 페이지를 읽고 이동·제출했다. `innerWidth=390`, `innerHeight=844`, `document.documentElement.scrollWidth=390`을 확인했다. year submit 후 2023 선택 및 결과가 유지됐고 이전/다음 이동에서 2024 제목·선택값이 맞았다. 광고 전면 vignette가 연도 링크 이동 한 번을 가로막았으나 닫은 뒤 목적지 이동을 확인했다.
- 실제 수연 Chrome의 GA4 Realtime 보고서에서 명시 조회 `eur_year_lookup_submit`, 연도 이동 `eur_year_navigate`, 결정일 제출 `base_rate_date_lookup_submit`의 수신을 확인했다. 운영 이벤트명 및 실행 결과는 확인했으나 Realtime 화면에는 고정 `page`/`action_origin` 값이 표시되지 않아 그 값은 코드 계약으로만 검증했다. 직접 제출/링크 테스트는 QA이며 수요·전환·사업성과에서 제외한다. 비공개 GA4 원행은 Avatar에만 보존한다.

## 검증 및 보존

- 실행: `npm run test:analytics`, `npm run test:series`, `npm run test:exchange-year`, `npm run test:base-rate-decisions`, 기존 `npm run test:base-rate-month`, `npm run test:exchange-compare`, `npm run lint`, `npx tsc --noEmit`, `npm run build:cf`.
- 결과: 단위·대표경계·기존 월말 조회·시계열 보존 테스트, lint, TypeScript, 실제 OpenNext Cloudflare production build가 통과했다. 기존 10/15 견적 회귀 13개 PASS는 Avatar가 별도 검증했으며 이 승인 작업에서는 동일 테스트를 불필요하게 반복하지 않았다. 최종 main 매니페스트와 원격·캐시 없는 clone의 파일 수·bytes·SHA-256 일치 여부는 이 문서 갱신 커밋 뒤 독립 확인한다.
- 모델: 실행 인터페이스에서 현재 선택 모델/effort를 직접 조회할 수 없어 GPT-6 Luna / high의 실제 선택은 확인하지 못했다. 전달 지시에는 해당 모델·effort가 지정되어 있었다.
- 운영: `main` 반영과 Cloudflare 운영 배포가 완료됐다. main commit `9fd3556ec44b82be95028c17dc0d67f5108c2d75`는 배포 확인 시의 앱 변경 SHA다. 이 메모·CURRENT·manifest는 그 뒤 보존 checkpoint로 갱신한다. 지정 `gpt-6-luna`/`high`는 전달 지시였고 실행 UI는 실제 선택값을 노출하지 않아 runtime 선택 확인은 미검증이다.
