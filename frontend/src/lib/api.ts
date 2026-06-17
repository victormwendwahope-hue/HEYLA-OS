// Thin fetch wrapper with refresh-token rotation, 401 auto-retry and 403 toast.
import { toast } from 'sonner';

const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
// Some deployments accidentally set VITE_API_URL to include /api/v1.
// Normalize to ensure we call backend routes under /api/*.
const BASE = RAW_BASE.replace(/\/api\/v1$/i, '/api');
const ACCESS_KEY = 'heyla_token';
const REFRESH_KEY = 'heyla_refresh';

export const apiBaseUrl = () => BASE;
export const apiEnabled = () => Boolean(BASE);

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(ACCESS_KEY, token);
  else localStorage.removeItem(ACCESS_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Coalesce concurrent refresh attempts.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  const rt = getRefreshToken();
  if (!rt || !BASE) return null;

  refreshing = (async () => {
    try {
      const r = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!r.ok) return null;
      const data = await r.json();
      setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      if (data.user) localStorage.setItem('heyla_user', JSON.stringify(data.user));
      return data.token as string;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

function handleUnauthorized() {
  setToken(null);
  setRefreshToken(null);
  localStorage.removeItem('heyla_user');
  // Soft redirect — avoid hard reload loops on /login.
  if (!location.pathname.startsWith('/login')) {
    toast.error('Session expired — please log in again');
    location.assign('/login');
  }
}

async function rawRequest(method: string, path: string, body: unknown, init: RequestInit, token: string | null) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  return fetch(`${BASE}${path}`, { ...init, method, headers, body: payload });
}

async function request<T>(method: string, path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  if (!BASE) throw new ApiError('API not configured (set VITE_API_URL)', 0, null);

  let res = await rawRequest(method, path, body, init, getToken());

  // Try refresh once on 401 (except on auth endpoints themselves).
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      res = await rawRequest(method, path, body, init, fresh);
    } else {
      handleUnauthorized();
    }
  }

  const text = await res.text();
  const data = text ? safeParse(text) : null;

  if (!res.ok) {
    const msg = (data as any)?.error || res.statusText;
    if (res.status === 403) toast.error(typeof msg === 'string' ? msg : 'You don\'t have access to this');
    if (res.status === 401 && path.startsWith('/auth/')) {
      // login/register fail — surface inline, no global redirect
    } else if (res.status === 401) {
      handleUnauthorized();
    }
    throw new ApiError(typeof msg === 'string' ? msg : 'Request failed', res.status, data);
  }
  return data as T;
}

function safeParse(t: string) { try { return JSON.parse(t); } catch { return t; } }

export const api = {
  get: <T>(p: string) => request<T>('GET', p),
  post: <T>(p: string, body?: unknown) => request<T>('POST', p, body),
  put: <T>(p: string, body?: unknown) => request<T>('PUT', p, body),
  patch: <T>(p: string, body?: unknown) => request<T>('PATCH', p, body),
  delete: <T>(p: string) => request<T>('DELETE', p),

  upload: async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<{ url: string; filename: string; size: number; mime: string }>('POST', '/upload', fd);
  },

  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/login', { email, password }),
    register: (data: { email: string; password: string; name: string; company?: string; accountType?: 'company' | 'individual' }) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/register', data),
    me: () => request<{ user: any }>('GET', '/auth/me'),
    refresh: (refreshToken: string) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/refresh', { refreshToken }),
    logout: (refreshToken?: string) => request<{ ok: true }>('POST', '/auth/logout', { refreshToken }),
    logoutAll: () => request<{ ok: true }>('POST', '/auth/logout-all'),
  },

  admin: {
    auditLogs: (q?: { limit?: number; offset?: number; q?: string }) => {
      const params = new URLSearchParams(q as Record<string, string>).toString();
      return request<any[]>('GET', `/admin/audit-logs${params ? `?${params}` : ''}`);
    },
    users: () => request<any[]>('GET', '/admin/users'),
    setRole: (id: string, role: string) => request<any>('PATCH', `/admin/users/${id}/role`, { role }),
    revokeSessions: (id: string) => request<{ ok: true }>('POST', `/admin/users/${id}/revoke-sessions`),
  },
};

export async function pingApi(timeoutMs = 1500): Promise<boolean> {
  if (!BASE) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(`${BASE}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    return r.ok;
  } catch { return false; }
}
