# 2026-09-28 CPI 세트 정식 판독 — 원자료

관측 시각: 2026-09-28 22:09 KST. 읽기 전용 수집이며 앱 코드·GA4 설정·배포는 바꾸지 않았다.

## Search Advisor

로그인된 Tooly 사이트의 콘텐츠 노출/클릭 보고서를 최근 30일·PC+Mobile로 읽었다. UI가 시작·종료일을 표시하지 않아 임의의 달력 범위로 바꾸지 않는다. 최근 업데이트는 **2026.09.27**이며, 전일 사전 관측의 9/26 갱신과 달리 새 스냅샷이다.

| 정확 URL | 클릭 | 노출 | CTR | 위치 |
|---|---:|---:|---:|---|
| `/data/prices/cpi` | 7 | 860 | 0.8% | 검색 웹문서 Top 30 2쪽 15행 |
| `/blog/cpi-money-value-history` | 92 | 1,946 | 4.7% | 검색 웹문서 Top 30 1쪽 2행 |

9/26 갱신 사전 관측과 비교하면 CPI는 클릭 7로 같고 노출은 800→860, 블로그는 클릭 89→92·노출 1,860→1,946이다. 키워드 Top 30 세 페이지를 모두 다시 읽었지만 `소비자물가지수`, `소비자물가`, `화폐가치 계산`, `화폐가치`는 없었다. `30년전 100만원 가치`는 6클릭·34노출·CTR 17.6%, `1990년 1만원의 가치`는 2클릭·45노출·CTR 4.4%였다. 키워드 표는 사이트 전체라 어느 URL 유입인지 연결하지 않는다.

Top 30 밖 직접 쿼리의 상세 행·검색·export는 UI에 없었다. 따라서 직접 쿼리의 노출·클릭·순위를 0으로 치환하지 않고 **원천 미제공**으로 둔다.

## 모바일 네이버 SERP

2026-09-28에 Chrome 390×844 CSS px viewport에서 각 쿼리를 1회 읽었다. 개인화·광고·실제 모바일 단말 순위의 재현이 아니다.

| 쿼리 | 상단 지형 | Tooly 첫 화면 |
|---|---|---|
| `소비자물가지수` | KOSIS(국가데이터처·소비자물가조사) 월별·연도별 통계 위젯과 관련 지표 | 없음 |
| `화폐가치 계산` | AI 브리핑, 중앙노후준비지원센터 화폐시간가치 계산, mods.go.kr CPI 환산, NH농협생명 | 없음 |

이는 상위 범용 쿼리에서 위젯·공공 결과가 공간을 차지한다는 관찰이다. 정확 URL 노출 0, 색인 실패, 전체 수요 0의 증거는 아니다.

## GA4 Data API

속성 `539462697`(Asia/Seoul)을 2026-08-30~2026-09-27의 완료 29일로 조회했다. 9/28은 당일이라 제외했다. 응답은 표본추출과 other-row 데이터 손실이 없었다.

### `pagePath × eventName` — eventCount / activeUsers

| pagePath | eventName | eventCount | activeUsers |
|---|---|---:|---:|
| `/blog/cpi-money-value-history` | `page_view` | 109 | 93 |
| `/blog/cpi-money-value-history` | `session_start` | 96 | 91 |
| `/blog/cpi-money-value-history` | `user_engagement` | 92 | 80 |
| `/blog/cpi-money-value-history` | `first_visit` | 91 | 91 |
| `/blog/cpi-money-value-history` | `cta_click` | 2 | 2 |
| `/blog/cpi-money-value-history` | `scroll` | 1 | 1 |
| `/data/prices/cpi` | `page_view` | 26 | 9 |
| `/data/prices/cpi` | `cpi_convert_run` | 26 | 9 |
| `/data/prices/cpi` | `session_start` | 11 | 8 |
| `/data/prices/cpi` | `user_engagement` | 14 | 9 |
| `/data/prices/cpi` | `form_start` / `form_submit` | 9 / 9 | 5 / 5 |
| `/data/prices/cpi` | `cpi_convert_form_submit` | 1 | 1 |
| `/data/prices/cpi` | `cpi_convert_preset_select` | 1 | 1 |
| `/data/prices/cpi` | `scroll` | 1 | 1 |

9/27만 다시 읽으면 CPI의 page_view 3·`cpi_convert_run` 3·`cpi_convert_form_submit` 1·`cpi_convert_preset_select` 1·`form_start` 1·`form_submit` 1·`user_engagement` 1이다. 모두 23:35~23:39 KST의 알려진 운영 QA에서 발생했다. 따라서 raw 26에서 배포 전과 비교 가능한 page_view·자동 실행은 23건이지만, activeUsers는 QA 사용자와 기존 사용자의 중복 여부를 분해할 수 없어 순차감하지 않는다. 새 직접 행동 두 건은 전부 QA로, 사용자 직접 행동 수요의 증거가 아니다.

### `landingPagePlusQueryString × sessionSourceMedium` — sessions / activeUsers

| 랜딩 | 세션 소스/매체 | sessions | activeUsers |
|---|---|---:|---:|
| `/blog/cpi-money-value-history` | `m.search.naver.com / referral` | 91 | 89 |
| `/blog/cpi-money-value-history` | `(direct) / (none)` | 1 | 1 |
| `/blog/cpi-money-value-history` | `naver / organic` | 1 | 1 |
| `/data/prices/cpi` | `m.search.naver.com / referral` | 5 | 4 |
| `/data/prices/cpi` | `naver / organic` | 2 | 2 |
| `/data/prices/cpi` | `default / (not set)` | 1 | 1 |

`m.search.naver.com / referral`은 네이버 검색·앱·중간 경로의 referral 표기일 수 있어 Search Advisor 자연검색 클릭과 합산하거나 같은 지표로 해석하지 않는다. 수익·광고 귀속 자료는 조회하지 않았다.
