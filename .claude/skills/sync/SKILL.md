---
name: sync
description: 코딩 착수 전 로컬 워킹트리가 origin/main보다 뒤처져 있는지 확인한다. 집·회사 등 여러 기계에서 Tooly 작업할 때, 다른 기계의 push를 pull하지 않은 채 낡은 코드에서 작업을 시작해 갈라지는 것을 막는다. "코드 짜기 전에 sync 체크", "/sync", "pull 확인해줘" 같은 요청에 사용. SessionStart 훅이 아니라 코딩 착수 시점에 수동으로 호출하는 스킬이다(하루 여러 세션 중 실제로 코딩을 시작할 때만 실행해 오발화를 없앤다).
---

# sync 체크 스킬 (Tooly)

Tooly는 집·회사 여러 기계에서 작업한다. 한 기계에서 push한 뒤 다른 기계에서 pull 없이 코딩을 시작하면, 로컬 HEAD가 origin/main보다 뒤처진 채로 새 커밋이 갈라져 나간다. 이 스킬은 **코딩 착수 직전**에 그 상태를 잡아낸다.

## 동작

1. `git fetch origin` 실행.
2. `git rev-list --count HEAD..origin/main` 과 `git status --porcelain --untracked-files=no` 으로 판정. **`--untracked-files=no`가 핵심** — untracked 신규 파일(예: 스킬 산출물, `.wrangler/` 등 빌드 산출물)은 fast-forward를 막지 않으므로 dirty 판정에서 제외한다. dirty 판정은 **tracked 파일의 미커밋 변경**(staged/modified)만 본다.
   - **origin/main이 앞섬 && tracked 변경 없음(clean)** → `git pull --ff-only origin main` 실행 후 결과(당겨온 커밋 로그) 보고.
   - **origin/main이 앞섬 && tracked 변경 있음(dirty)** → **절대 자동 merge/pull 하지 않는다.** "로컬에 미커밋 변경이 있어 pull을 보류합니다 — commit 또는 stash 후 다시 시도하세요"라고 경고만 하고 멈춘다.
   - **origin/main이 앞서지 않음** → "로컬이 최신 상태입니다"라고 보고.
3. 새 기계(특히 회사 등 첫 클론)에서 `node_modules/`가 없으면 `npm install`이 필요하다고 안내한다. 이는 빌드뿐 아니라 `AGENTS.md`가 참조하는 `node_modules/next/dist/docs/`(Next.js 16 정식 컨벤션 경로)를 실존시키기 위함이다 — 이 경로는 인젝션이 아니라 정식 파일이므로 삭제하지 말 것.

## 참고 명령어

```bash
git fetch origin
git rev-list --count HEAD..origin/main             # 0이면 뒤처지지 않음
git status --porcelain --untracked-files=no        # 비어있으면 clean (untracked 무시)
git pull --ff-only origin main                     # 앞섰고 clean일 때만
```

## 하지 않는 것

- dirty 상태에서 자동으로 merge/rebase/stash 하지 않는다 — 항상 사람이 정리하게 둔다.
- `--ff-only` 이외의 pull(merge commit 생성, rebase)을 임의로 선택하지 않는다. fast-forward가 안 되면 그 사실만 보고하고 사용자 판단을 기다린다.
- SessionStart 등 자동 훅으로 동작하지 않는다 — 반드시 사용자가 코딩 착수 시점에 호출했을 때만 실행한다.
