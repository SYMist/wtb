# Tooly 클라우드 작업

이 안내는 **독립 클라우드 환경**에서만 적용한다. 로컬 실행에는 적용하지 않는다. 로컬 로그인·파일·MCP는 자동 공유되지 않으므로 필요한 지시와 결과는 사용자 코드블록으로 수동 전달한다.

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
