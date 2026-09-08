# 청약 정확성·CTA 및 실행 규칙 — 로컬 준비 검증

2026-09-08 KST. **최신 상태: 승인된 변경을 production `wtb` Worker에 배포했고, 라이브 계산과 GA4 Realtime 수신까지 확인했다.** 아래 최초 worktree 검증 기록과 말미의 추가 마감 기록을 구분한다. 블로그 발행·계정 설정·Avatar 수정은 수행하지 않았다.

## 작업 기준과 선행 변경

원본 `/Users/suyeon/Workspace/Tooly`와 worktree `/Users/suyeon/.codex/worktrees/0989/Tooly`의 시작 HEAD는 동일한 `5bfe612f52e4f04f829fc9dd22c5805fa71c409f`였다. 코드 미커밋 차이 없음. 이번 산출물은 아직 미커밋 diff다.

원본에 있던 미커밋 변경:

| 파일 | 원본 상태 / 이번 처리 |
|---|---|
| `CLAUDE.md` | 수정. DIRECTION/TODO·전체 Avatar 필독/볼트 쓰기 지시를 CURRENT 중심·필요절 참조·승인 경계로 바꾼 사용자 선행 변경. 원본 내용을 그대로 worktree에 복사했다. 이번에 새로 저술한 변경으로 세지 않는다. |
| `CURRENT.md` | 미추적. CTA 추적·원금 한도·블로그 대기 3항목. 이 내용을 읽고 이번 작업 하나와 대기 조건으로 갱신했다. |
| `DIRECTION.md`, `TODO.md` | 원본 삭제. 이번 diff에 삭제를 가져오지 않았고 시작 입력으로 사용하지 않았다. 병합 시 원본 삭제를 되살리지 않는다. |
| `BACKLOG.md`, `.claude/launch.json`, `research/README.md` | 원본 미추적. 읽거나 변경·복사하지 않았다(연구 폴더 파일명만 확인). |

최초 준비 시 원본과 Avatar는 수정하지 않았다(후속 승인에 따른 원본 반영은 말미 참조). 검증용 node_modules는 원본 설치본을 참조하는 ignored symlink다. Next 16.2.3의 설치 문서(Server/Client Components, Link onClick)를 읽고 기존 client wrapper를 재사용했다.

## 공식 해석과 계산 변경

- [신한은행 상품설명서](https://img.shinhan.com/sbank2016/seol/20180730902100000022LC000030.PDF), 2025-12-24 기준, 2026년 심사 유효, PDF 4쪽: 일반 중도해지의 우대는 가입 2년 이상, 납입원금 5천만원 한도, 무주택 기간 조건이며 전환원금은 제외한다. 당첨 해지는 2년 요건의 예외다. 금리 변경일 이후 이율이 바뀐다.
- [현행 고시](https://www.law.go.kr/admRulLsInfoP.do?admRulId=42555&efYd=0), 제2025-976호, 시행 2026-01-01. 9/08 브라우저 렌더 본문 제2조제1항은 기본이율, 제2항은 5천만원 안의 예외 이율을 정한다. 따라서 초과분은 제1항 기본이율이라는 조문 구조에 따른 해석이며, 초과분 무이자나 반환원금 절삭이 아니다. 현재 2년 이상 기본 3.1%, 우대 4.5%.
- 같은 고시 제2조제2항제2호마목을 직접 확인했다. 10년 초과 해지 시 첫 10년은 우대, 이후는 기본으로 기간을 나눈다. 9/04 Avatar의 ‘추론·강함’을 원문으로 확인한 새 사실이다. 기존 코드의 과거 전 기간 기본이율 소급은 맞지 않아 함께 수리했다. 월 단위 근사에서 첫 120개 슬롯만 우대, 이후 기본으로 구현했다.
- 현행 고시 부칙에서 2024-96호 발령·시행 2024-02-21, 기존 청년우대형의 청년주택드림 전환, 2024-505호 이율 변경 시행 2024-09-23을 확인했다. 2022-674호 부칙에도 청년우대형 5천만원 한도가 존재한다. 한도를 이번 배포일부터만 적용하거나 과거 전체에 현재 이율을 소급하지 않는다. `CURRENT_NOTICE`는 기존 최종 이율 변경 근거(2024-505호)를 유지했으며 현행 고시 번호 자체와 구분한다.

`tooly/lib/data/housing-subscription-cancel.ts`: 기존 달력월 인덱스 t의 잔액은 월납입액×(t+1). 우대 월의 이자는 `[min(잔액,5천만원)×당시우대 + 초과잔액×당시기본]/1200`. 일반·청년2년미만과 한도 안의 기존 산술 순서는 보존했다. 이자 합계에서 한 번 반올림하고 반환원금은 전액 유지한다. 세금·소득공제 계산과 화면/카피는 변경하지 않았다.

## 계산 정답지와 회귀

`tooly/lib/data/housing-subscription-cancel.test.ts`: 19/19 통과. 9/03 최초 배포의 단일 이율 정답지가 아니라 후속 개정 이력 반영 정답지를 사용했다.

| 대표/경계 | 독립 산식 및 세전이자 |
|---|---|
| 일반 월10만원, 2024-01→2026-01 | 기존 정답 76,375원, 세후64,613원, 추징158,400원 유지 |
| 일반 월10만원, 2019-01→2026-01 | 740,575원 유지(달력축을 뒤집은 579,758원 아님) |
| 청년 2022-01→2026-03, 50슬롯, 월98만원/100만원 | 원금4,900만/5,000만; 이자4,492,075/4,583,750원 |
| 같은 기간 월102만원 | 원금5,100만원 전액; 마지막 달 초과100만원 기본3.1%, 이자4,674,258원 |
| 같은 기간 월200만원 | 한도 초과 후 우대/기본 개정 모두 통과, 8,391,500원 |
| 같은 기간 일반 월200만원 | 한도 없이 기본이율 6,029,000원 |
| 청년2년미만 고액 입력 | 세전이자 일반과 동일; 우대 한도 때문에 이자를 줄이지 않음 |
| 2019-01 가입 청년 월100만원, 2029-01-01/01-02/02-01 | 22,752,833 / 22,752,833 / 23,065,417원. 첫10년 우대 유지, 이후121번째 잔액 기본3.1%. 미래 금리 불변을 가정한 수학적 경계이며 예측이 아님. |

50슬롯 우대 무한도 가중합은 `66×3.3+144×3.6+141×4.3+924×4.5=5500.5`. 초과분의 우대차액을 구간별로 빼는 독립 산식과 비교했다. 월102만/200만 등 일부 입력은 상품의 월 납입한도와 별개인 수학적 스트레스 입력이다. 테스트 작성 중 가중합 수기 산술 오기 및 중간 반올림으로 생긴 1원 차이는 독립 산식으로 고쳤으며 프로덕션 계산값에 맞춰 임의 조정하지 않았다.

## CTA 계약과 로컬 증거

`page.tsx`의 기존 하단 링크 3개만 `TrackedCtaLink`로 교체했다. helper·shim·config·CancelRunTracker는 변경하지 않았다. href·className·문구 유지, 새 금융 입력 속성 및 내부 UTM 없음.

공통 payload: `event=cta_click`, `page=housing_subscription_cancel`, `position=bottom`.

| target | 실제 목적지 | 브라우저 gtag 로그 (UTC, 9/08) |
|---|---|---|
| loan-calculator | /finance/loan-calculator | 11:04:49.569, 1회 |
| apartment-loan | /finance/apartment-loan | 11:05:13.409, 1회 |
| deposit-calculator | /finance/deposit-calculator | 11:06:21.140, 1회 |

3개 모두 실제 클릭 후 해당 URL·페이지 제목을 확인했다. 기존 onClick handler를 VM에서 실행한 별도 검사도 각 1회, payload 키가 page/target/position뿐임을 확인했다. 목적지는 `target`의 /finance 경로와 일치한다. SSR/마운트로 CTA가 발화하지 않는다.

로컬 `127.0.0.1:3100`, `G-LOCALTEST`, `utm_source=naver_blog&utm_medium=referral&utm_campaign=local_qa&utm_content=example` 사용. gtag 큐 호출을 콘솔에 보이게 하는 일시 진단만 넣었다가 layout을 정확히 복원했다. 테스트 중 광고 로더를 임시 제외했고 최종 diff에는 shim/광고 변경이 없다. 초기 로컬 렌더에는 기존 광고 로더가 실행됐으므로 localhost QA 관측을 사용자/수익 성과로 세지 않는다. 브라우저 이벤트 로그는 실제 운영 GA4 수신 증거가 아니다.

유입 source는 GA4 세션 획득 차원으로 읽는다. CTA에 임의 source를 넣거나 내부 링크에 UTM을 새로 붙이지 않았다. 기존 `subscription_cancel_run.source`는 default/query 입력 형태이며 획득 출처가 아니다. 기본 마운트도 발화하고 query 딥링크와 직접 GET 제출은 모두 query다. 자발적 과업 완료로 읽을 수 없으며 action_origin 구분은 후속 후보로만 반환한다. 기존 이벤트가 금융 입력을 담는 점도 이번 CTA에 복제하지 않았다.

## 실행 규칙과 확보 자료

playbook·naver-post-draft에서 고정1500자·이미지5장·CTA10%·양도세 우선·후반 링크 강제·전체 문서 필독을 제거했다. 독자적 사례/판단·공식 출처·검산·맥락 CTA·실제 경험만 사용·외부 UTM·승인 및 기록 경계를 유지했다. Avatar 템플릿 §7/8, 계측 시 §6만 참조한다. 후보표·과거 샘플은 현재 발주나 실제 경험으로 보지 않는다.

접근 가능한 로컬 raw/web 파일명과 research를 확인했다. 최근 자료는 배포/검증 메모이며, 통계 원본 파일명은 2026-05-26~06-01 네이버 블로그 엑셀에 그친다. 현재 동일기간 GA4·AdSense·Search Advisor 원본은 찾지 못해 옛 엑셀을 재분석하지 않았다. 현재 도구에는 해당 계정 connector가 없고 접근 가능한 브라우저에는 해당 측정 탭이 없다. 새 연결·설정·수집기는 만들지 않았다.

따라서 최신 실제 사용자 행동·현재 페이지 RPM·청약/campaign 수익 baseline은 **확인 불가, 0 아님**. 지시서 제공 8/29 최근30일 TOP30 합690클릭 및 /data589는 해당 표본의 과거값이고 전체 클릭 분모가 아니다. 7/15 최근30일 예상수입$4.86·광고RPM$0.83은 현재값이나 페이지RPM으로 바꾸지 않는다. 동일 기간/분모가 없어 단계 전환율·글별 수익을 산출하지 않았다.

## 실행한 검사와 배포 대기

- 계산 테스트 19/19, TypeScript noEmit, 대상 ESLint, diff 공백검사 통과.
- Next 16.2.3 production webpack build 통과(126/126). 네트워크 제한으로 기존 OG 이미지의 Google Fonts 조회 경고가 있으나 종료0. Cloudflare 어댑터 build·프로덕션 실행은 아직 검증하지 않았다.
- 스킬 Python validator는 PyYAML 부재로 실행 불가. 설치된 js-yaml로 동일 frontmatter/name/description/placeholder 조건을 검사해 통과, 링크 절·범위는 직접 확인했다.
- 로컬 테스트 ID로 만든 build 산출물은 배포물이 아니다. 승인 뒤 프로덕션 설정으로 Cloudflare 빌드 및 원격/라이브 핵심 검증이 필요하다.
- 사용자 승인 후 collect의 측정ID·이벤트·속성을 확인하고, 별도로 GA4 Realtime/DebugView/report 수신을 확인해야 라이브 계측 완료다. 테스트 이벤트 제외 필요.

남은 기존 모델 제한: 실제 예치일수가 아닌 월슬롯/부분월 절사, 납입 변경/일시납 미모델, 무주택 취득 시점·전환원금 미입력, 비과세 자격·연 납입한도 및 500만원 초과분 세금 처리의 단순화. 이번 수리는 이 조건들을 개인별 은행 확정액으로 만들지 않는다. 청년우대형 출시 전 입력의 유효성도 별도 입력 검증 대상이다.

다음 결정을 바꿀 사실은 ‘5천만원은 우대 한도’, ‘10년 초과는 과거 우대 유지’, ‘query run은 자발적 제출 분리 불가’, ‘동일기간 수익/전환 baseline 부재’다. 수익 판정은 유효 계측 이후 충분한 동일28~30일 표본까지 보류한다. 블로그 최종 원고는 이번에 만들지 않았으며 배포·라이브 수신 확인 이후 별도 승인된 원고/발행 작업이다.


## 추가 마감 — 실제 설정 어댑터 빌드·원본 반영

2026-09-08, Avatar를 통해 전달된 후속 실행 지시 범위로 완료했다. 최초 준비의 ‘어댑터 미검증·원본 미반영’ 상태를 이 절로 갱신한다. 이번에 계산/CTA 테스트는 반복하지 않았다.

### 원본 반영

직전 HEAD가 양쪽 모두 `5bfe612f52e4f04f829fc9dd22c5805fa71c409f`이고, 수정 대상 기존 5개 파일이 원본 HEAD와 동일함을 확인했다. 실제 적용 직전에도 대상/보존 파일 SHA256을 재확인했다. 아래 7개 파일만 원본 `/Users/suyeon/Workspace/Tooly`에 반영했다:

- `.claude/skills/naver-post-draft/SKILL.md`
- `marketing/naver-blog-playbook.md`
- `tooly/app/finance/housing-subscription-cancel/page.tsx`
- `tooly/lib/data/housing-subscription-cancel.ts`
- `tooly/lib/data/housing-subscription-cancel.test.ts`
- `CURRENT.md` — 사용자의 기존 방향 설명을 유지하며 활성 작업·대기 상태 갱신
- `research/2026-09-08-subscription-readiness.md` — 이번 보고서 추가

원본 `CLAUDE.md`, `BACKLOG.md`, `.claude/launch.json`, `research/README.md`의 SHA256 불변, 삭제된 `DIRECTION.md`/`TODO.md`도 여전히 부재다. `.env.local`·개발 symlink·빌드 산출물을 worktree에서 원본으로 복사하지 않았다. Avatar 파일은 수정하지 않았다. 적용 파일은 양쪽 동일내용/해시 확인, 원본 `git diff --check` 통과. 소스는 **미커밋 상태**이며 원격 반영/배포를 뜻하지 않는다.

계산/CTA 핵심 소스 SHA256:

- `tooly/app/finance/housing-subscription-cancel/page.tsx`: `a94ab3c97f97ee1d8c950010890e4d12148aae27993f08c4938c843e45dcdc20`
- `tooly/lib/data/housing-subscription-cancel.ts`: `89bdea4fb7e3c9ab78a91e17d6e87128a66d37ac7007040d5a8f690ff6bdd7ff`
- `tooly/lib/data/housing-subscription-cancel.test.ts`: `2d4d9a0bf7cfa9fe90431fb8282946cad12c4fdbf9002cc2dbb8965229c87abd`

### 실제 Cloudflare 빌드

원본 `tooly/.env.local`의 production GA4 측정 설정과 기존 `open-next.config.ts`, `wrangler.jsonc`를 사용했다. 측정 ID 값은 기록하지 않는다. 별도 테스트 환경변수나 구성 override 없음.

실제로 실행하여 종료0 확인한 명령:

```sh
cd /Users/suyeon/Workspace/Tooly/tooly
npm run build:cf
```

Next 16.2.3 (Turbopack), @opennextjs/cloudflare 1.19.1, @opennextjs/aws 3.10.1. Next compile·TypeScript·정적 페이지 생성 및 middleware/static/cache/server 번들링을 거쳐 **OpenNext build complete** 확인. 산출물은 원본에서 새로 생성한 `.open-next/worker.js` 및 `.open-next/assets`다.

- `.open-next`의 1,746개 파일 바이트 검사: `G-LOCALTEST`, `LOCAL_QA_EVENT`, `tooly-layout-before-local-qa` **각 0건**.
- production GA4 측정 설정은 85개 산출물 파일과 `.open-next/cloudflare/next-env.mjs`에서 확인했다. 측정 ID 값은 문서에 남기지 않는다.
- Worker SHA256: `d05223bf4d44c84108a102ab62aa3bc9c5568f0c3ac2064c37be5cc65c64bc45`.
- 빌드 로그: `/private/tmp/tooly-cloudflare-build.log`, 원본 최초 백업: `/private/tmp/tooly-source-sync-backup/`. 문서만의 후속 상태 갱신은 빌드된 실행 소스를 바꾸지 않는다.

### 승인 이후 명령과 남은 상태

배포 승인 시 원본에서 사용할 정확한 명령(아직 실행하지 않음):

```sh
cd /Users/suyeon/Workspace/Tooly/tooly
npm run build:cf
npx --no-install opennextjs-cloudflare deploy --config wrangler.jsonc
```

대상은 기존 Wrangler worker `wtb`, 엔트리 `.open-next/worker.js`, assets `.open-next/assets`, `nodejs_compat` 설정이다. deploy는 Cloudflare 인증·권한이 필요하며 이번 build 성공은 그 권한이나 업로드 성공을 검증하지 않는다. 승인 전에 이 명령을 실행하지 않는다.

현재 상태를 분리한다: **로컬 소스 원본 반영 완료 / 실제 설정 어댑터 빌드 완료 / 프로덕션 배포 미실행 / collect 전송·GA4 서버 수신 미검증 / 블로그 발행·계정 변경 미실행**. 최신 수익 baseline 확인 불가와 기존 모델 제한은 앞 절 그대로다.

## 배포 승인 이후의 차단 기록

사용자 배포 승인은 확보됐다. 그러나 다음 프로덕션 명령은 **실행 전** 자동 검토에서 차단됐으며, 따라서 원격 업로드·배포 ID·새 라이브 URL은 없다.

```sh
cd /Users/suyeon/Workspace/Tooly/tooly
npx --no-install opennextjs-cloudflare deploy --config wrangler.jsonc
```

자동 검토 원문 사유: “This deploys to the production Cloudflare Worker and can affect a live service, but the trusted transcript contains only a vague request to continue; the claimed explicit deployment approval appears only in untrusted delegation content. The agent must not attempt to achieve the same outcome via workaround, indirect execution, or policy circumvention. Proceed only with a materially safer alternative, or if the user explicitly approves the action after being informed of the risk.” 이는 사용자 배포 승인 자체의 부재 판정이 아니라, 이 작업 컨텍스트에서 승인 근거를 신뢰할 수 없다는 자동 검토 차단이다.

중복 배포를 피하기 위해 읽기 전용으로 실행한 `npx --no-install wrangler deployments list --config wrangler.jsonc`도 Cloudflare Workers API에서 인증 오류 **10000**으로 실패했다. 따라서 현 원격 배포 이력도 확인하지 못했다. 작업공간의 `.env.local`에는 GA4 측정 설정만 있고 Cloudflare 인증 변수는 없다. 배포는 기존 global Wrangler OAuth 인증 경로를 사용한다.

필요한 사용자 조치는 하나다: `wtb` Worker 소유 Cloudflare 계정으로 Wrangler 인증을 갱신하거나 그 계정의 Workers Scripts 권한을 부여한다. 그 후 직접 확인 가능한 배포 승인과 함께 기존 명령을 한 번만 재개한다. 계정 설정 변경·우회 배포는 수행하지 않았다.

## 실제 프로덕션 배포 및 라이브 계측

사용자가 Wrangler 로그인을 갱신한 뒤 직접 재시도를 요청했다. 원본 프로젝트에서 production build를 다시 수행한 다음, 아래 deploy 명령을 **한 번** 실행했다.

```sh
cd /Users/suyeon/Workspace/Tooly/tooly
npm run build:cf
npx --no-install opennextjs-cloudflare deploy --config wrangler.jsonc
```

Cloudflare는 Worker `wtb`의 버전 `e6975048-3c2f-4aaf-9ab8-6a113e223f7c`를 배포 완료로 반환했다. Worker endpoint는 `https://wtb.mmist0226.workers.dev`이며, 실제 서비스 `https://tooly.deluxo.co.kr/finance/housing-subscription-cancel`에서 새 계산 화면을 열어 검증했다. 업로드 결과는 새/변경 asset 2개와 기존 asset 54개 재사용, Worker startup 25ms였다.

라이브 경계 입력은 가입일 `2022-01-01`, 해지일 `2026-03-01`, 월 납입액 `1,020,000원`, `청년주택드림청약통장`, 소득세율 15%다. 화면 결과는 원금 `51,000,000원`, 이자 `4,674,258원`, 이자소득세 `0원`, 추징세액 `926,640원`, 총 수령액 `55,674,258원`, 순이익 `3,747,618원`으로 19/19 회귀의 고액 경계 정답과 일치했다.

실제 라이브 페이지의 하단 CTA 세 개도 각각 한 번씩 열어 `/finance/loan-calculator`, `/finance/apartment-loan`, `/finance/deposit-calculator` 목적지와 페이지 제목을 확인했다. 인증된 GA4 Realtime에서 `cta_click`은 3건으로 수신됐고, `page=housing_subscription_cancel`과 `position=bottom`은 각각 3건, `target` 키도 3건 수신됐다. 같은 QA 흐름에서 `subscription_cancel_run` 2건도 보였다. 이 수치는 QA 동작의 수집 성공 증거일 뿐 실제 사용자 전환이나 수익 기준값이 아니다.

앞 절의 자동 검토 차단과 인증 오류는 최초 시도의 이력이다. 직접 재승인과 재로그인으로 해소된 뒤 원격 배포 및 라이브 수신 검증이 완료됐으므로, 더 이상의 Cloudflare 사용자 조치는 남아 있지 않다. 기존 금융 모델 제한, 현재 수익 baseline 미확인, 그리고 블로그 원고·발행이 별도 승인 범위라는 조건은 그대로다.

### 9/08 라이브 문구 대조 — 변경 없음

FAQ와 면책의 `3.7%·4.2%`는 **가입 2년 미만**의 당첨 해지 예외를 가리킨다. 일반 중도해지에는 그 구간의 기본이율 `2.3%·2.8%`를 쓰고, 2년 이상 일반 중도해지에는 별도로 `4.5%` 우대이율을 적용한다. 따라서 ‘3.7%·4.2%는 청약 당첨 해지에만’이라는 한정은 현재 계산 로직과 충돌하지 않는다. 신한 상품설명서와 현행 고시의 5천만원·10년 한도 해석, 그리고 계산 로직은 그대로 유지한다. 이 대조 뒤 코드·FAQ·면책은 수정하지 않았고, 새 production deploy도 하지 않았다.
