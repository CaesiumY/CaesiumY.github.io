import { useEffect, useState } from "react";
import { getCurrentTheme, isValidTheme } from "@/utils/theme";

/**
 * HTML data-theme 속성을 추적하는 커스텀 훅
 *
 * @returns 현재 테마 ("light" | "dark")
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme();
 *   return <div>Current theme: {theme}</div>;
 * }
 * ```
 */
export function useTheme(): "light" | "dark" {
  // 초기 테마 감지 (getCurrentTheme 유틸리티 재사용)
  const [theme, setTheme] = useState<"light" | "dark">(getCurrentTheme);

  useEffect(() => {
    // HTML data-theme 속성 변경 감지
    const observer = new MutationObserver(() => {
      const dataTheme = document.documentElement.getAttribute("data-theme");

      // isValidTheme 유틸리티로 타입 보장
      if (isValidTheme(dataTheme)) {
        setTheme(dataTheme);
      }
    });

    // documentElement의 attributes 변경 감지
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // 클린업: 옵저버 연결 해제
    return () => observer.disconnect();
  }, []);

  return theme;
}
