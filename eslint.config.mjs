import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/.worktrees/**",
    "apps/chat/**",
    "**/playwright-report/**",
    "**/test-results/**",
  ]),
]);

export default eslintConfig;
