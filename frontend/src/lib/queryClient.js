import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Chỉ thử lại khi lỗi mạng/máy chủ (status 0 hoặc >= 500), không thử lại lỗi 4xx
      retry: (failureCount, error) => (!error?.status || error.status >= 500) && failureCount < 2,
    },
  },
});
