import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY, USER_KEY, setUnauthorizedHandler } from '../api/client';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';

const AuthContext = createContext(null);

function isExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function readStored() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || isExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { token: null, user: null };
  }
  try {
    return { token, user: JSON.parse(localStorage.getItem(USER_KEY)) };
  } catch {
    return { token, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStored);
  const [initializing, setInitializing] = useState(Boolean(session.token));
  const [sessionExpired, setSessionExpired] = useState(false);

  const persist = useCallback((token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setSession({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession({ token: null, user: null });
    setSessionExpired(false);
  }, []);

  // Global 401 handling (expired / invalid token)
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      setSessionExpired(true);
    });
  }, [logout]);

  // Re-validate the stored session against the backend on first load
  useEffect(() => {
    if (!session.token) {
      setInitializing(false);
      return;
    }
    usersApi
      .getMe()
      .then((user) => persist(session.token, user))
      .catch(() => {})
      .finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login({ email, password });
      setSessionExpired(false);
      persist(res.token, res.user);
      return res.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload);
      persist(res.token, res.user);
      return res.user;
    },
    [persist]
  );

  const updateUser = useCallback((user) => persist(localStorage.getItem(TOKEN_KEY), user), [persist]);
  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.token && session.user),
      isAdmin: String(session.user?.role || '').toUpperCase() === 'ADMIN',
      initializing,
      sessionExpired,
      clearSessionExpired,
      login,
      register,
      logout,
      updateUser,
    }),
    [session, initializing, sessionExpired, clearSessionExpired, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
