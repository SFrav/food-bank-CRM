import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './AuthProvider';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,         
      retry: 1,
      refetchOnWindowFocus: true, 
      refetchOnReconnect: true,
    },
    
  },
  
});

// if (import.meta.env.DEV) {
//   queryClient.getQueryCache().subscribe((e) => {
//     if(e.type ==='updated' && (e.action.type === 'fetch' || e.action.type === 'success')) {
//       console.log('[cache]', e.action.type, JSON.stringify(e.query.queryKey),
//     `${e.query.getObserversCount()} observers`);
//     }
//   });
// }

const RealtimeSync = () => {
  useRealtimeSync();
  return null;
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RealtimeSync />
      {children}
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </AuthProvider>
  </QueryClientProvider>
);
