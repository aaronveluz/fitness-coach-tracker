// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/app/providers/index.tsx
//
// Wraps the entire application with global context providers.
// Order matters: providers that depend on others must be nested inside them.
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// TanStack Query client — global config for all API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't auto-refetch when window regains focus (can be jarring in business apps)
      refetchOnWindowFocus: false,
      // Retry failed requests once before showing error
      retry: 1,
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      // Don't retry mutations (POST/PUT/DELETE) — they may have side effects
      retry: 0,
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools — only visible in development (not in production build) */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}

