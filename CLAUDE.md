# Tooly — 실행 프로젝트

Tooly는 한국 금융 의사결정에 도움이 되는 계산기와 데이터 페이지를 운영한다. 현재 실제 유입의 중심은 네이버 데이터 시계열이며, 범용 계산기 확장이나 Google 노출만을 위한 작업은 우선순위가 아니다.

## 시작 순서

1. `CURRENT.md` — 지금 할 일·완료 기준·대기 조건
2. 변경 대상 코드 또는 `research/`의 해당 조사 메모
3. 필요한 경우에만 Avatar `FOCUS.md`와 `wiki/web/performance.md`
4. 코드를 고칠 때는 먼저 `tooly/AGENTS.md`와 관련 Next.js 문서를 읽는다.

`DIRECTION.md`, 과거 `TODO.md`, `WORKLOG.md`는 시작 입력이 아니다. `BACKLOG.md`는 사용자가 후보 검토를 요청했을 때만 연다.

## 작업별 계약 참조

Avatar 단일 실행 계약: [Tooly 실행 계약 템플릿](</Users/suyeon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Avatar/wiki/portfolio/templates/tooly.md>). 해당 작업에 필요한 절만 읽는다. 전체 템플릿을 복사하거나 시작 필독으로 추가하지 않는다.

- 키워드·SERP·신규 페이지: §1~3
- 기존 페이지 개선·구성: §4~5
- 계측: §6
- 블로그 원고·전환 판독: §7~8
- 색인 감사: §9
- 실행 지시·결과 반환: §10

## 기록 경계

- 현재·다음·조건부 작업: `CURRENT.md`
- 보류 후보: `BACKLOG.md`
- 신규 페이지·키워드 채택 전 조사: `research/YYYY-MM-DD-주제.md`
- 코드와 배포 결과: 코드·Git 이력·필요한 작업 문서
- 데이터가 다음 전략을 바꾸면: 사실·증거·위험을 Avatar에 반환한다. `wiki/web/performance.md`와 `log/web.md` 등 Avatar 정본의 반영은 Avatar가 담당하며 Tooly가 직접 수정하지 않는다.
- Tooly는 전략·우선순위를 임의 변경하지 않는다. 변경 제안은 근거와 함께 Avatar에 반환한다.

## 검증과 외부 실행

- 금융 계산 변경은 대표 입력값과 관련 테스트를 확인한다.
- 계측 변경은 실제 이벤트 도달을 확인한다.
- 국소 카피·링크·문서 수정은 변경 범위만 확인한다.
- 배포와 네이버 블로그 발행은 사용자 승인 후 진행한다.

작업 종료 때 전체 투두나 장황한 handoff를 만들지 않는다. 바뀐 사실과 다음 결정에 필요한 위험만 짧게 남긴다.
