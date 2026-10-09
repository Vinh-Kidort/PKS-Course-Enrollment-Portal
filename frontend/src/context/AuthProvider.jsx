import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '../api/auth';
import { setUnauthorizedHandler, tokenStorage } from '../lib/api';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  // Có token trong máy thì phải xác thực lại trước khi biết user là ai
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.get()));

  const logout = useCallback(
    ({ expired = false } = {}) => {
      tokenStorage.clear();
      setUser(null);
      queryClient.clear(); // xóa cache để không lộ dữ liệu của tài khoản cũ
      if (expired) toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    },
    [queryClient],
  );

  // axios báo 401 (token hết hạn/không hợp lệ) -> đăng xuất
  useEffect(() => {
    setUnauthorizedHandler(() => logout({ expired: true }));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Khôi phục phiên đăng nhập khi tải lại trang
  useEffect(() => {
    if (!tokenStorage.get()) return undefined;
    let cancelled = false;
    authApi
      .me()
      .then((me) => !cancelled && setUser(me))
      .catch(() => {
        /* 401 đã được interceptor xử lý; lỗi mạng thì giữ token để thử lại lần sau */
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await authApi.login(credentials);
    tokenStorage.set(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
