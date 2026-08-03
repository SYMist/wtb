import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare / OpenNext build artifacts: bundled JS chunks large enough
    // to OOM the linter if parsed.
    ".open-next/**",
    ".wrangler/**",
  ]),
  {
    rules: {
      // Quotes in Korean copy are intentional and React escapes them safely.
      // Keep the rule only for `>` and `}`, which are usually JSX typos.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    },
  },
]);

export default eslintConfig;
