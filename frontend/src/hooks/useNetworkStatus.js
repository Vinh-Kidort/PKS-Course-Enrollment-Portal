import { useSyncExternalStore } from 'react';
import { requestTracker } from '../lib/requestTracker';

// true khi có request chờ quá lâu (máy chủ có thể đang khởi động)
export const useServerSlow = () => useSyncExternalStore(requestTracker.subscribe, requestTracker.isSlow);

const subscribeOnline = (callback) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

export const useOnlineStatus = () =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
