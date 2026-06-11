import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  { rules: { "no-console": "error" } },
  {
    // 스킬 CLI 스크립트는 console(stdout/stderr) 출력이 인터페이스 그 자체 — 이 디렉터리만 no-console 해제 (사용자 승인)
    files: [".claude/skills/**/scripts/**"],
    rules: { "no-console": "off" },
  },
  { ignores: ["dist/**", ".astro", "public/pagefind/**"] },
];
