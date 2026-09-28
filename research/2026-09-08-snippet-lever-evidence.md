# 2026-09-08 스니펫 레버 최종판정 증거

관찰일: 2026-09-08 KST. 이 기록은 읽기 전용 조사이며 코드·배포·발행 변경이 없다.

## 사전 판정선과 측정 창

- 판정선: 쿼리 `2020년 5월 기준금리` CTR **2.1% → 4.0%**.
- Avatar의 2026-08-27 정정에 따라 판정 창은 배포 후·금리 인상 전인 **2026-08-08~2026-08-26 (19일)** 이다. 8/27 전후는 분리해 노출과 함께 제시해야 한다. 표본이 얇거나 기간이 맞지 않으면 기각이 아니라 **연기**다.

## 직접 확보한 사실

- Tooly 라이브 페이지 [`/data/rates/base`](https://tooly.deluxo.co.kr/data/rates/base)의 hero는 `역대 최저 2020년 5월 0.50%`를 유지한다. 카드의 최저값도 `0.5% / 2020년 5월`이다.
- 로컬 원천 [`base-rate-series.json`](../tooly/lib/data/base-rate-series.json) `stats.min`도 `2020-05`, `0.5`이며, hero는 이 값을 동적으로 조합한다.
- 네이버 **모바일 URL** `https://m.search.naver.com/search.naver?query=2020년%205월%20기준금리`에서 직접 조회했다. Tooly 결과가 노출되고, 스니펫은 정규화해 `2000년 이후 ... 역대 최저 2020년 5월 0.50%, 역대 최고 2000년 10월 5.25% ...`로 읽힌다. 네이버가 span으로 나눈 글자는 정규화 텍스트로 판정했다. 화면에는 경쟁 결과 calcscoop도 함께 보이며 표시일은 `2026.07.19.`다.
- Avatar 독립검수 원본: [`2026-09-08_naver-mobile-snippet.jpg`](/Users/suyeon/Library/Mobile%20Documents/iCloud~md~obsidian/Documents/Avatar/raw/web/2026-09-08_naver-mobile-snippet.jpg), 메타데이터 [`json`](/Users/suyeon/Library/Mobile%20Documents/iCloud~md~obsidian/Documents/Avatar/raw/web/2026-09-08_naver-mobile-snippet.json). 관측 시각은 2026-09-08 21:01:50 KST, viewport는 **390×844 CSS px**다. 모바일 URL을 IAB desktop user-agent로 열었으므로 실제 휴대전화 하드웨어/UA를 에뮬레이션한 증거는 아니며, CTR이나 과거 SERP도 입증하지 않는다.
- calcscoop의 실제 sitemap XML은 이 환경에서 `ERR_BLOCKED_BY_CLIENT`로 열리지 않아 sitemap `<lastmod>` 변화는 확인하지 못했다. 다만 검색 결과에서 읽은 해당 경쟁 페이지의 본문 기준 시점도 `2026-07-19 23:11 KST`다: <https://calcscoop.com/stats/base-interest-rate.html>. 이는 sitemap 날짜의 증거가 아니다.

## Avatar가 확보한 Search Advisor 원본

- 원본: `/Users/suyeon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Avatar/raw/web/2026-09-08_searchadvisor-browser.json`.
- 관측: 2026-09-08 21:15:20 KST, 업데이트 `2026.09.07`, **최근 30일**, PC+Mobile. UI는 시작·종료일을 표시하지 않아 기간을 추정하지 않는다.
- 쿼리 `2020년 5월 기준금리`: **50 클릭 / 1,438 노출 / CTR 3.5%**. 4.0% 목표보다 낮은 현재-30일 관측이다.
- 검색 웹문서 Top 30 클릭 합계: **768**. 그중 `/data` **700 (91.15%)**, `/blog` **53**. 요약의 `7.7백`은 반올림된 표시이므로 Top 30 합계를 사이트 전체 실제 클릭으로 단정하지 않는다.
- UI 선택지는 최근 1/7/30/60/90일뿐이다. 따라서 사전 판정 창 8/08~8/26을 복원하지 못했으며, **3.5%만으로 원 실험의 최종 기각을 내리지 않는다**.

## Avatar가 확보한 GA4 원본

- 원본: `/Users/suyeon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Avatar/raw/web/2026-09-08_ga4-browser.json`; 인증된 Tooly GA4 속성, 기간 **2026-08-11~2026-09-07**.
- `/data/rates/base`: page_view **353 / 309 users**, cta_click **1**, scroll **5**. `/data/rates/mortgage`: page_view **76 / 66 users**, CTA는 전체 cta_click 9건의 page별 표에 없고 scroll **1**이다.
- 전체 cta_click **9**건은 전기 블로그 5, 복리 블로그 1, dday 블로그 1, CPI 1, base 1이다. 전체 compare_run **386**, scroll **54**.
- `position`은 보고서 차원 선택기에서 찾지 못했지만 계정 전체 미등록으로 단정할 수 없고, scroll 임계값도 미확인이다. 이벤트 수는 의도된 과업 완료를 뜻하지 않으며, GA4 수익 `₩0`은 AdSense 수익 0의 증거가 아니다.

## 결측과 판정

이 작업의 브라우저 로그인 결측은 Avatar의 Search Advisor·GA4 원본으로 해소됐다. 다만 8/08~8/26 CTR 창은 여전히 복원되지 않았다. 스니펫이 보인다는 관찰과 현재 30일의 목표 미달은 시계열 유입 전략의 기각과 별개다.

필요한 원본/내보내기 항목:

1. **네이버 Search Advisor**에서 쿼리 `2020년 5월 기준금리`, 기간 **2026-08-08~2026-08-26**의 클릭·노출·CTR(그리고 필요 시 평균 게재순위), 8/27 이후 별도 행. Google Search Console 수치는 Google 검색용 보조 자료일 뿐 이번 네이버 4.0% 판정에 대입할 수 없다.
2. 전체 실제 자연검색 클릭의 같은 정확한 기간과 비교 기간. 이전 `640`/`690` 값은 각각의 기간과 범위(특히 `690`은 Top 30 합계)를 붙여야 하며 사이트 전체로 대체하면 안 된다. 현재 `768` 역시 Top 30 합계다.
3. GA4 `position`별 `inline`/`bottom`/`blog_cta` 분해와 scroll 임계값. 현재 page별 이벤트 수만 있으며, position 미발견은 계정 미등록 증거가 아니다.

## 판정

현재 확보한 것은 hero 유지, 네이버 모바일 노출·스니펫, 최근 30일의 3.5% 관측, 그리고 8/11~9/07의 GA4 page별 이벤트다. 8/08~8/26 창이 없으므로 4.0% 기준의 통과·기각 어느 쪽도 내리지 않는다. 상태는 **목표 미달 관측, 최종 판정 연기, 시계열 유입 전략 유지**다.
