import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getScrollPosition, clearScrollPosition } from '@/utils/scrollPosition';

interface Props {
  slug: string;
}

export default function ContinueReadingToast({ slug }: Props) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    // Prevent showing toast multiple times
    if (hasShownRef.current) return;

    const entry = getScrollPosition(slug);

    // 저장된 위치가 없으면 토스트 표시하지 않음
    if (!entry) return;

    hasShownRef.current = true;

    // Small delay to ensure page is ready
    const timer = setTimeout(() => {
      toast('이어 읽기', {
        description: `지난번에 ${entry.progress}%까지 읽으셨어요`,
        action: {
          label: '이어서 읽기',
          onClick: () => {
            window.scrollTo({
              top: entry.position,
              behavior: 'smooth'
            });
          },
        },
        duration: 8000,
        onDismiss: () => {
          // Clear position so toast doesn't show again
          clearScrollPosition(slug);
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  return null; // This component only triggers toast, no UI
}
