import { throttle } from "es-toolkit";
import {
  saveScrollPosition,
  cleanupOldEntries,
  getScrollPosition,
} from "@/utils/scrollPosition";

export function initializeScrollSaver(slug: string): () => void {
  // Run cleanup on init
  cleanupOldEntries();

  // Navigation lock - View Transitions 완료 후 스크롤 안정화 대기
  // 문제: Astro View Transitions는 페이지 전환 시 scroll 이벤트를 발생시키며,
  //       이 이벤트가 스크롤 복원보다 먼저 실행되어 scrollY=0으로 저장됨
  let isNavigationLocked = true;
  let navigationLockTimeout: ReturnType<typeof setTimeout> | null = null;

  // 500ms 후 잠금 해제 (View Transition 애니메이션 + 스크롤 복원 시간)
  navigationLockTimeout = setTimeout(() => {
    isNavigationLocked = false;
  }, 500);

  const saveCurrentPosition = () => {
    // Navigation lock 활성 중이면 저장하지 않음
    if (isNavigationLocked) return;

    const scrollY = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    // 위치 검증: 기존 저장값이 있고 현재 위치가 현저히 낮으면 저장하지 않음
    // (race condition으로 인한 의도치 않은 0 근처 값 방지)
    const existingEntry = getScrollPosition(slug);
    if (existingEntry && existingEntry.position > 100 && scrollY < 50) {
      return; // 의심스러운 상황 - race condition으로 인한 0 근처 값
    }

    const progress =
      docHeight > 0 ? Math.round((scrollY / docHeight) * 100) : 0;
    saveScrollPosition(slug, scrollY, progress);
  };

  // trailing edge만 사용 - 스크롤 중지 후 저장 (더 예측 가능)
  const throttledSave = throttle(saveCurrentPosition, 2000, {
    edges: ["trailing"],
  });

  // 2. visibilitychange - save when tab becomes hidden
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      saveCurrentPosition();
    }
  };

  // 3. beforeunload - save when leaving page
  const handleBeforeUnload = () => saveCurrentPosition();

  // 4. astro:before-swap - save before View Transitions
  const handleBeforeSwap = () => saveCurrentPosition();

  // Register event listeners
  window.addEventListener('scroll', throttledSave);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('astro:before-swap', handleBeforeSwap);

  // Return cleanup function
  return () => {
    if (navigationLockTimeout) clearTimeout(navigationLockTimeout);
    window.removeEventListener("scroll", throttledSave);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("astro:before-swap", handleBeforeSwap);
    throttledSave.cancel();
  };
}
