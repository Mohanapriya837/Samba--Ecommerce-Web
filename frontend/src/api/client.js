import axios from 'axios';

export const TOKEN_KEY = 'samba_token';
export const USER_KEY = 'samba_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 on a non-auth endpoint while we hold a token means the token is invalid/expired
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !url.startsWith('/auth/') && localStorage.getItem(TOKEN_KEY)) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Please check that the backend is running.';
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  return fallback;
}

export const getFieldErrors = (error) => error?.response?.data?.validationErrors || {};

/** True for a 401 that will already trigger the global "session expired" logout/redirect,
 * so callers can skip showing their own (redundant, confusing) error toast for it. */
export const isSessionExpiredError = (error) => error?.response?.status === 401;

/** True for a 409 (e.g. duplicate email / ISBN / category name) so a form can also
 * highlight the specific field, since the backend sends a plain message for these, not
 * per-field validationErrors like it does for 400s. */
export const isConflictError = (error) => error?.response?.status === 409;

/** Removes empty values so they are not sent as query params. */
export const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined));

export default api;
