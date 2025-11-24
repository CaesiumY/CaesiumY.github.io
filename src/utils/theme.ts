/**
 * 현재 적용된 테마를 감지합니다.
 * 우선순위: data-theme 속성 → prefers-color-scheme 미디어 쿼리
 *
 * @returns "light" | "dark"
 */
export function getCurrentTheme(): "light" | "dark" {
  // SSR 환경 체크
  if (typeof window === "undefined") return "light";

  // 1순위: HTML data-theme 속성 확인
  const dataTheme = document.documentElement.getAttribute("data-theme");
  if (dataTheme === "dark" || dataTheme === "light") {
    return dataTheme;
  }

  // 2순위: 시스템 다크모드 설정 확인
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * data-theme 속성이 유효한 값인지 검증합니다.
 *
 * @param value - 검증할 속성 값
 * @returns 유효한 테마 값이면 타입 보장된 값 반환, 아니면 false
 */
export function isValidTheme(value: string | null): value is "light" | "dark" {
  return value === "light" || value === "dark";
}
