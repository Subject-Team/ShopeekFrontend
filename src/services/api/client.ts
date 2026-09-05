import type { AuthTokenResponse } from '../../types';

const API_BASE = '/api/v1';

// Helper to get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('shopeek_token');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('shopeek_refresh_token');
};

// The current device's web-session id, issued by the backend on login. It lets
// the frontend (a) mark its own session in the Settings list and (b) tell the
// refresh flow which session it belongs to so revoked sessions cannot renew.
const SESSION_ID_KEY = 'shopeek_session_id';
export const getWebSessionId = (): string | null => localStorage.getItem(SESSION_ID_KEY);
export const setWebSessionId = (id: string | null): void => {
  if (id) localStorage.setItem(SESSION_ID_KEY, id);
  else localStorage.removeItem(SESSION_ID_KEY);
};

const clearAuthStorage = (): void => {
  localStorage.removeItem('shopeek_token');
  localStorage.removeItem('shopeek_refresh_token');
  localStorage.removeItem('shopeek_user');
  setWebSessionId(null);
  window.dispatchEvent(new Event('shopeek_unauthorized'));
};

// Single-flight silent token refresh via the backend's GoTrue refresh grant.
// `ok`: new tokens stored; `invalid`: refresh token conclusively rejected (or
// absent) so the session is dead; `unavailable`: transient network failure —
// keep the stored session and let the caller surface the error.
type RefreshOutcome = 'ok' | 'invalid' | 'unavailable';

let refreshPromise: Promise<RefreshOutcome> | null = null;

export const refreshAccessToken = async (): Promise<RefreshOutcome> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return 'invalid';
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: refreshToken,
          ...(getWebSessionId() ? { session_id: getWebSessionId() } : {}),
        }),
      });
      if (!res.ok) return 'invalid';
      const data = (await res.json()) as AuthTokenResponse;
      localStorage.setItem('shopeek_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('shopeek_refresh_token', data.refresh_token);
      }
      localStorage.setItem('shopeek_user', JSON.stringify(data.user));
      if (data.web_session_id) setWebSessionId(data.web_session_id);
      window.dispatchEvent(new Event('shopeek_token_refreshed'));
      return 'ok';
    } catch {
      return 'unavailable';
    }
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const doFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

// Custom fetch wrapper adding the Authorization header, with on-401 refresh+retry.
// Only a conclusively-rejected session clears local auth storage; transient
// network/refresh failures must NOT log read-only users out.
export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let response = await doFetch(input, init);

  if (response.status === 401) {
    const outcome = await refreshAccessToken();
    if (outcome === 'ok') {
      response = await doFetch(input, init);
      if (response.status === 401) {
        // A freshly issued token was still rejected — the session is unusable.
        clearAuthStorage();
      }
    } else if (outcome === 'invalid') {
      // Refresh token is conclusively dead. Clear invalid or expired token.
      clearAuthStorage();
    }
    // outcome === 'unavailable': transient failure; keep the stored session.
  }

  return response;
};
