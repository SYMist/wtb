# 환율 비교·CPI 환산 직접 행동 측정 — 2026-09-27

이 변경은 로컬 코드·검증까지이며, 새 이벤트의 **유효 시작일은 실제 배포일**이다. 이 문서에 적은 과거 수치와 섞지 않는다. 2026-09-27의 운영 배포 시도는 인증 문제로 실패했으므로 시작일은 아직 없다.

## 2026-09-27 GitHub 반영과 Worker 배포 시도

- 23:02 KST에 `origin/main`을 fetch한 뒤 force 없이 `7d0bead..da1e189`을 push했다. 원격과 로컬의 확인 SHA는 `da1e189f17a471441380f7a7127b50ef6414d39b`이다. 이 SHA에는 예적금 과세 안내 수정, CPI 사전 관측 문서, 직접 행동 계측 코드와 로컬 검증 문서가 포함된다.
- 같은 시각 `tooly/`에서 `npx wrangler deploy`를 실행했다. OpenNext 배포 단계에서 `GET /accounts/09d72232f707e28e95922a664792a0ea/workers/services/wtb`가 Cloudflare API 403 / 인증 오류 10000을 반환해 Worker 버전 생성과 운영 반영은 일어나지 않았다.
- Wrangler `whoami`가 확인한 OAuth 계정은 `Creatrip` (`528fd41cd4c44ee062741eb4939cbb1b`)이다. `wtb`의 대상 계정은 `09d72232f707e28e95922a664792a0ea`이므로, 그 계정의 Workers 배포 권한으로 로그인한 뒤 동일 명령을 다시 실행해야 한다. 기존 자격 증명을 제거하지 않고 `wrangler login`도 시도했으나 대상 계정 승인이 완료되지 않았다.
- 배포 실패 뒤 `https://tooly.deluxo.co.kr`의 `/`, `/data/exchange/compare`, `/data/prices/cpi`, `/finance/deposit-calculator`는 모두 HTTP 200이었고 각 HTML에는 `G-3FEVQE9CED`만 나타났다. 이는 기존 운영 서비스의 가용성과 공개 GA 설정 확인일 뿐, 이번 코드를 담은 Worker·새 네 이벤트·GA4 수신의 증거가 아니다.
- 따라서 배포 버전, 운영 UI 동작, 네 새 이벤트의 실제 gtag 호출·네트워크 전송·GA4 Realtime 수신은 기록하지 않는다. 재배포가 성공하면 각 항목을 시간·배포 버전·실제 행동·Realtime 결과로 추가하고, QA 이벤트는 성과 집계에서 분리한다.

## 과거 이벤트의 해석 가능한 범위

GA4 속성 `539462697`에서 2026-08-12~09-08을 `pagePath × eventName`으로 다시 읽었다. `compare_run`은 `/data/exchange/compare` 한 행에 **394 eventCount / 189 activeUsers**로 전부 귀속된다. 따라서 과거 394건의 페이지 귀속 결측은 해소됐다.

하지만 이 이벤트는 URL 렌더 때 발생한다. 기본 결과, 외부 딥링크, 직접 폼 제출 뒤 도착, 프리셋 뒤 도착, 새로고침을 구분하지 못한다. 394를 실제 비교 완료·수요·전환 분모로 쓰지 않는다. CPI의 기존 `cpi_convert_run`도 같은 렌더 혼합이며, 8/29~9/26 사전 관측의 `/data/prices/cpi` 31건은 직접 환산 완료가 아니다.

GA4에 등록된 맞춤 측정기준·측정항목은 0개다. 기존 `page`와 `source` 매개변수는 표준 보고서에서 `pagePath` 또는 행동 출처로 사용할 수 없으므로, 새 분석은 표준 `eventName`과 `pagePath`만 사용한다.

## 배포 후 이벤트 계약

| 이벤트 | 발생 조건 | 보내는 값 | 빠른 중복·재실행 | 표준 분석 |
|---|---|---|---|---|
| `compare_form_submit` | `/data/exchange/compare`에서 브라우저 유효성 검사를 통과한 GET 폼 제출 | `page=exchange_compare`, `action_origin=form` | 750ms 안의 중복 제출만 억제. 같은 값을 나중에 다시 제출하면 새 행동 | `pagePath=/data/exchange/compare` + `eventName=compare_form_submit` |
| `compare_preset_select` | 데이터에서 만든 환율 프리셋 링크 선택 | `page=exchange_compare`, `action_origin=preset` | 750ms 안의 빠른 중복 클릭만 억제 | 같은 페이지 + 이 이벤트명 |
| `cpi_convert_form_submit` | `/data/prices/cpi`에서 유효한 시점·금액 폼 제출 | `page=prices_cpi`, `action_origin=form` | 위와 같음 | `pagePath=/data/prices/cpi` + `eventName=cpi_convert_form_submit` |
| `cpi_convert_preset_select` | 데이터에서 만든 CPI 프리셋 링크 선택 | `page=prices_cpi`, `action_origin=preset` | 위와 같음 | 같은 페이지 + 이 이벤트명 |

새 이벤트에는 금액·시점·통화 같은 금융 입력 원문을 넣지 않는다. `action_origin`은 DebugView 등의 payload 확인 보조값이며, 맞춤 측정기준을 등록하기 전에는 표준 집계에서 분해하지 않는다. 출처별 분해는 이벤트명을 사용한다.

`compare_run`과 `cpi_convert_run`은 자동 결과 렌더라는 기존 의미를 유지한다. 기본 페이지, 쿼리/외부 딥링크, 새로고침은 새 네 이벤트를 전혀 보내지 않는다. 사용자가 뒤로 돌아오거나 같은 값으로 다시 명시 실행하면 750ms 창 밖의 별도 행동으로 한 번 기록한다.

## 완성으로 말할 수 있는 것과 아닌 것

`*_form_submit`, `*_preset_select`은 **사용자가 명시적으로 시작한 행동**이다. GET 네비게이션의 서버 계산 결과가 실제로 표시됐다는 성공 완료 이벤트가 아니다. 네비게이션 실패, 브라우저 이탈, 서버 렌더 실패는 이 최소 변경만으로 제외하지 못한다. 따라서 배포 후에는 직접 행동 분모를 분석할 수 있지만, 성공 결과 분모는 여전히 **측정 불가**다.

성공 결과까지 필요해지면 서버 결과 도착과 앞선 사용자 동작을 안전하게 연결하는 별도 설계가 필요하다. 맞춤 `action_origin` 등록만으로는 과거 데이터를 복구할 수 없고, 이 작업 범위에서는 GA4 관리 설정 변경도 하지 않는다.

## 검증과 재조회

- 로컬 단위: 유효 제출/프리셋마다 1회, 750ms 안의 빠른 중복은 0회, 751ms 뒤 같은 명시 행동은 새 1회가 되도록 `test:analytics`로 검증했다. 브라우저 내장 invalid 입력은 submit 이벤트 전에 차단하고, 핸들러도 `checkValidity()`를 재확인한다.
- 로컬 브라우저: production GA를 쓰는 기존 dev 서버 대신 임시 복사본을 Next 16 `next dev --webpack --port 3001`로 기동했다. `G-LOCALTEST`가 두 페이지의 HTML GA config에만 들어간 것을 먼저 확인했다. 임시 복사본에서만 `trackEvent`의 gtag 호출 직후 `console.info` 진단을 넣고 CUA TabDev logs를 읽었다. 이 로그는 **호출·이름·payload 증거**이며 dataLayer 전체 큐, 네트워크 전송, GA4 서버 수신 증거는 아니다.
  - 환율 비교: 유효 폼은 `compare_form_submit {page: exchange_compare, action_origin: form}` 1회, `from=1970-01` 무효 입력은 URL 변화·새 로그 0회, 프리셋 재선택은 900ms 뒤 두 번 각각 `compare_preset_select {page: exchange_compare, action_origin: preset}` 1회씩이었다. 기본 URL, 외부 형식의 쿼리 딥링크, reload는 두 새 이벤트 0회였다.
  - CPI: 유효 폼은 `cpi_convert_form_submit {page: prices_cpi, action_origin: form}` 1회와 `?from=2000-01&amount=2000000#money-value` 결과 표시, `amount=0`은 새 로그 0회였다. 프리셋 재선택은 900ms 뒤 두 번 각각 `cpi_convert_preset_select {page: prices_cpi, action_origin: preset}` 1회씩이었다. 기본 URL, 딥링크, reload는 두 새 이벤트 0회였다.
- 빌드: Next production build와 Cloudflare OpenNext adapter build(`build:cf`)를 각각 통과했다. 라이브 서버 도달 검증은 배포하지 않았으므로 하지 않았다.
- 배포 후 첫 분석: 실제 배포일 다음의 완료된 일자를 시작으로, GA4 `run_report`에서 `pagePath,eventName`과 `eventCount,activeUsers`를 조회한다. 대상은 위 네 이벤트와 두 정확 path다. 같은 기간의 기존 `compare_run`,`cpi_convert_run`은 자동 렌더 진단용으로만 별도 제시한다.
