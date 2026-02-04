import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';
import { useTheme } from '@/hooks/useTheme';

export default function SonnerProvider() {
  const theme = useTheme(); // Returns "light" | "dark"

  return (
    <Toaster
      theme={theme}
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-foreground)',
        },
      }}
    />
  );
}
