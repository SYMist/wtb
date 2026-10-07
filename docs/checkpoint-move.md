# Tooly 작업물 이동 체크포인트

이 문서는 로컬 Avatar와 독립 클라우드 환경 사이에서 Tooly 작업물을 이동하기 전후의 완료 절차다. Git 저장소의 추적 파일은 원격 `main`이 보존본이고, Git에 넣을 수 없는 필수 미디어가 있을 때만 승인된 비공개 외부 저장소를 별도 보존본으로 쓴다. 토큰·쿠키·OAuth 자료·환경값·credentials·캐시·`node_modules`·`.git`은 어느 보존본에도 넣지 않는다.

현재 체크포인트의 파일 목록과 SHA-256은 [소스 매니페스트](checkpoints/tooly-source-manifest.json)에 있다. 이 매니페스트는 자기 자신을 제외한 모든 Git 추적 파일을 다룬다. Git 제외 필수 미디어는 현재 없다. 새로 생기면 공개 Git에 올리지 말고, 소유자가 기존 비공개 Avatar/handoff 저장소에 넣은 뒤 파일명·SHA-256·크기·접근 소유자·복원 절차만 이 문서와 `CURRENT.md`에 기록한다.

## 이동 전

1. `git status --short --ignored`로 추적 변경·미추적 파일·무시 파일을 분리해 확인한다. 더러운 추적 파일은 reset·overwrite하지 않고 소유자 브랜치에 커밋한다. 필요한 무시 파일은 위의 비공개 보존 절차를 먼저 끝낸다.
2. `git fetch --prune origin`, `git switch main`, `git merge --ff-only origin/main`으로 원격 최신 소스를 fast-forward만 허용해 받는다. 충돌, 비-fast-forward, 또는 깨끗하지 않은 트리는 이동 차단이다.
3. `node scripts/portable-checkpoint.mjs write docs/checkpoints/tooly-source-manifest.json`를 실행하고, 생성된 매니페스트와 필요한 작업 문서를 커밋한다. `git push origin main` 뒤 `git ls-remote origin refs/heads/main`의 SHA가 로컬 `HEAD`와 같은지 확인한다.

## 독립 복원

캐시·기존 worktree가 없는 별도 디렉터리에서 원격 SHA를 명시해 clone·checkout한다. 그 checkout에서 다음을 실행한다.

```sh
node scripts/portable-checkpoint.mjs verify docs/checkpoints/tooly-source-manifest.json
git diff --no-ext-diff --quiet
git status --short --ignored
```

검증은 파일 수·전체 바이트·각 파일의 SHA-256과 추적 파일 목록을 비교한다. 마지막 두 명령이 깨끗한 상태를 보여야 한다. 검증 실패, 현재 `main`이 매니페스트보다 앞섬, 원격 SHA 불일치, 또는 필수 비공개 자산의 복원 증거 부재 중 하나라도 있으면 이동은 완료가 아니다.

## 새 클라우드 환경

환경 설정의 install/start 지침은 이 순서를 자동으로 요구한다. 새 런타임에서 최신 `main`을 fetch하고 깨끗한 트리에서 fast-forward한 뒤 매니페스트를 검사한다. `CURRENT.md`, 소스, 필수 자산의 외부 체크포인트가 확인되기 전에는 편집·배포·데이터 갱신을 시작하지 않는다. Actions가 `main`을 바꿔 매니페스트가 오래됐으면 그 SHA를 고정해 기록하고 새 체크포인트를 만든 뒤에만 이동을 다시 완료할 수 있다.
