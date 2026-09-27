# 2026-09-27 CPI 성과 사전 관측 — 원자료

관측 시각: 2026-09-27 22:24 KST. 읽기 전용 수집이며 앱 코드, 계측 설정, 배포는 변경하지 않았다. 9월 28일 정식 판독을 대체하지 않는다.

## Search Advisor

로그인된 Tooly 사이트 보고서에서 확인했다. 화면 조건은 **최근 30일, PC+Mobile, 최근 업데이트 2026.09.26**이다. UI가 시작일·종료일을 표시하지 않으므로 달력 범위로 바꾸어 쓰지 않는다.

| 정확 URL | 클릭 | 노출 | CTR | 위치 |
|---|---:|---:|---:|---|
| `/data/prices/cpi` | 7 | 800 | 0.9% | 검색 웹문서 Top 30의 2쪽 15행 |
| `/blog/cpi-money-value-history` | 89 | 1,860 | 4.8% | 검색 웹문서 Top 30의 1쪽 2행 |

키워드 Top 30은 1~3쪽을 모두 열어 확인했다. 직접 쿼리 `소비자물가지수`, `소비자물가`, `화폐가치 계산`, `화폐가치`는 보이지 않았다. 대신 `30년전 100만원 가치`는 6클릭/34노출/17.6%, `1990년 1만원의 가치`는 2클릭/45노출/4.4%였다. 이 키워드 표는 사이트 전체 표라서 어느 URL의 유입인지 연결하지 않는다.

Top 30 밖의 해당 쿼리를 0으로 바꾸지 않았다. 화면에서 제공한 정상 경로(세 쪽 페이지 이동)를 끝까지 확인했지만 쿼리 상세 검색이나 export 제어는 보이지 않았다. 따라서 이 세션에서는 Top 30 밖 원행과 정확 쿼리의 0 여부를 **원천 미제공**으로 둔다.

## GA4 Data API

속성 `539462697` (`Tooly`, Asia/Seoul)을 단발 `ga4-mcp-call`로 읽었다. 고정 기간은 배포 시작일을 포함하고 **당일(9/27)을 제외한 2026-08-29~2026-09-26, 29일**이다. 전일(9/26)은 표준 보고서에 지연 반영될 수 있으므로 9월 28일에 같은 범위 규칙으로 재조회한다. 응답은 표본추출·other-row 데이터 손실 없음이었다.

### `pagePath × eventName` — eventCount / activeUsers

| pagePath | eventName | eventCount | activeUsers |
|---|---|---:|---:|
| `/blog/cpi-money-value-history` | `page_view` | 106 | 90 |
| `/blog/cpi-money-value-history` | `cta_click` | 2 | 2 |
| `/blog/cpi-money-value-history` | `session_start` | 92 | 87 |
| `/blog/cpi-money-value-history` | `user_engagement` | 88 | 76 |
| `/blog/cpi-money-value-history` | `first_visit` | 87 | 87 |
| `/blog/cpi-money-value-history` | `scroll` | 1 | 1 |
| `/data/prices/cpi` | `page_view` | 31 | 11 |
| `/data/prices/cpi` | `cpi_convert_run` | 31 | 11 |
| `/data/prices/cpi` | `cta_click` | 1 | 1 |
| `/data/prices/cpi` | `form_start` | 8 | 4 |
| `/data/prices/cpi` | `form_submit` | 8 | 4 |
| `/data/prices/cpi` | `session_start` | 14 | 9 |
| `/data/prices/cpi` | `user_engagement` | 13 | 9 |
| `/data/prices/cpi` | `first_visit` | 7 | 7 |
| `/data/prices/cpi` | `scroll` | 1 | 1 |

`cpi_convert_run`과 블로그 `cta_click`은 `pagePath`와 함께 반환됐으므로 이 표 안에서만 페이지 귀속으로 쓴다. 설정 확인 결과 등록된 맞춤 측정기준·측정항목은 없었다. 따라서 `cta_click`의 `page` 매개변수나 버튼 위치, 자동/딥링크/직접제출 구분은 이 원자료로 분해할 수 없다.

### `landingPagePlusQueryString × sessionSourceMedium` — sessions / activeUsers

| 랜딩 | 세션 소스/매체 | sessions | activeUsers |
|---|---|---:|---:|
| `/blog/cpi-money-value-history` | `m.search.naver.com / referral` | 87 | 85 |
| `/blog/cpi-money-value-history` | `(direct) / (none)` | 1 | 1 |
| `/blog/cpi-money-value-history` | `naver / organic` | 1 | 1 |
| `/data/prices/cpi` | `m.search.naver.com / referral` | 5 | 4 |
| `/data/prices/cpi` | `naver / organic` | 2 | 2 |
| `/data/prices/cpi` | `default / (not set)` | 1 | 1 |

GA4에는 사람의 실제 입력, 자동 실행, 딥링크·직접제출을 식별하는 측정기준이 없다. 이전 QA 이벤트와 실제 사용자의 이벤트도 이 추출만으로 분리할 수 없다. 수익/광고 귀속 보고서는 요청·수집하지 않았고, 여기의 이벤트를 광고수익으로 해석하지 않는다.

## 모바일 네이버 SERP

두 쿼리를 각 1회씩 모바일 UA로 받았다. 방식은 9월 3일 관측과 동일한 `https://m.search.naver.com/search.naver?query=<쿼리>` + iPhone Safari UA + `Accept-Language: ko-KR` 이며, HTML에서 script/style을 제거한 뒤 본문을 읽었다.

| 쿼리 | 응답 바이트 | Tooly 도메인/텍스트 | 관찰한 상단 지형 |
|---|---:|---:|---|
| `소비자물가지수` | 995,178 | 0 / 0 | KOSIS(국가데이터처·소비자물가조사) 출처의 네이버 통계 위젯과 정의·관련 지표가 상단을 차지했고, AI 브리핑·KOSIS 결과가 뒤따랐다. |
| `화폐가치 계산` | 578,159 | 0 / 0 | AI 브리핑이 상단에 있었고 중앙노후준비지원센터의 화폐 시간 가치 계산과 여러 상업 계산기 결과가 뒤따랐다. |

두 응답 모두 raw HTML의 `tooly.deluxo.co.kr`과 정규화 텍스트의 `tooly`가 0회였다. 이는 이번 두 번의 SERP에 Tooly가 없었다는 관찰일 뿐, 색인·수요·Search Advisor 노출의 0 증거는 아니다.

### 실제 화면 보완 — 390×844

22:30 KST에 기존 Chrome의 `m.search.naver.com`을 **390×844 CSS px** responsive viewport으로 열어 같은 두 쿼리를 각 1회 육안 확인했다. 이 확인은 별도 iPhone 하드웨어나 모바일 UA가 아니라 데스크톱 Chrome의 좁은 viewport이며, 개인화·광고·순위 안정성을 말하지 않는다.

- `소비자물가지수`: 첫 화면에 `월별 119.99 (2020=100) '26.06`, `연도별 116.61 (2020=100) '25`와 **KOSIS(국가데이터처, 소비자물가조사)** 출처, 정의·관련 지표 카드가 보였다. 첫 화면에 Tooly 결과는 없었다.
- `화폐가치 계산`: 첫 화면은 **AI 브리핑**과 중앙노후준비지원센터의 `화폐시간가치 계산` 결과가 보였다. 로드 뒤 화면의 AI 본문은 KOSTAT·mods.go.kr·OurCalc 출처와 CPI 기반 환산 공식을 보였고, 아래에 중앙노후준비지원센터·mods.go.kr·NH농협생명 결과가 이어졌다. 첫 화면에 Tooly 결과는 없었다.

이 두 visual check는 HTML 관측을 실제 responsive 화면으로 보완한다. 스크린샷은 이 작업 세션의 브라우저 증거로 확인했으나 저장·배포 가능한 독립 이미지 파일은 만들지 않았다.
