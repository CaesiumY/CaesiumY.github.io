/**
 * /posts 아래 정적 라우트 이름.
 *
 * check-post-classification.mjs(예약어와 겹치는 글 디렉터리 금지)와
 * e2e-scope.mjs(예약 라우트 URL을 글 참조로 오인하지 않기)가 같은 목록을
 * 봐야 한다. 한쪽만 고치면 두 검사가 다른 예약어 집합을 쓰게 되므로 여기서
 * 한 번만 도출한다.
 *
 * 상수를 적지 않고 디렉터리에서 파생하는 이유: 예약의 원인 자체가 "/posts
 * 아래 정적 라우트 디렉터리의 존재"이므로 탭이 늘어도 고칠 필요가 없다.
 * 대괄호로 시작하는 것([...page], [...slug])은 동적 라우트라 예약어가 아니다.
 */

import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

export const POSTS_ROUTES = path.join(repoRoot, "src/pages/posts");

export function reservedRouteSegments() {
  if (!existsSync(POSTS_ROUTES)) return [];
  return readdirSync(POSTS_ROUTES, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith("["))
    .map(entry => entry.name);
}
