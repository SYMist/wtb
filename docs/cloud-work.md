# Tooly 클라우드 작업

이 안내는 **독립 클라우드 환경**에서만 적용한다. 로컬 로그인·파일·MCP는 자동 공유되지 않는다. 환경을 넘길 때는 먼저 [작업물 이동 체크포인트](checkpoint-move.md)를 완료한다.

앱은 `tooly/`에 있고, 잠금 파일은 `tooly/package-lock.json`이다.

## 온라인 준비

```sh
cd tooly
npm ci
npx --yes tsx lib/data/housing-subscription-cancel.test.ts
```

온라인 `tsx` 실행은 이후 오프라인 검증에 필요한 캐시를 준비한다.

## 오프라인 검증

```sh
cd tooly
npx --offline --yes tsx lib/data/housing-subscription-cancel.test.ts
npx --no-install eslint app/finance/housing-subscription-cancel/page.tsx lib/data/housing-subscription-cancel.ts
```

변경에 필요한 경우에만 `npm run build`를 실행한다. 이 setup에서는 Cloudflare 배포나 블로그 발행을 실행하지 않는다.

## 새 런타임 시작 게이트

의존성 설치보다 먼저 저장소 루트에서 다음을 실행한다. 현재 트리에 변경이 있거나 fast-forward할 수 없으면 멈추고 보존 절차를 진행한다. reset·강제 checkout으로 해결하지 않는다.

```sh
git fetch --prune origin
git diff --no-ext-diff --quiet
git diff --cached --no-ext-diff --quiet
git switch main
git merge --ff-only origin/main
node scripts/portable-checkpoint.mjs verify docs/checkpoints/tooly-source-manifest.json
```

이 검증은 `CURRENT.md`, 모든 추적 소스와 Git에 보관된 필수 자산을 포함한다. Git 제외 필수 미디어가 새로 필요해지면 공개 Git에 넣지 말고 [이동 체크포인트](checkpoint-move.md)의 비공개 보존 절차를 완료한다. 매니페스트가 최신 `main`과 맞지 않거나 외부 checkpoint SHA가 원격과 일치하지 않으면, 편집·배포·데이터 갱신을 시작하지 않는다.
