// Thin fetch wrapper with refresh-token rotation, 401 auto-retry and 403 toast.
import { toast } from 'sonner';
import { isSafeRedirectUrl } from '@/lib/secure';

const runtimeBase =
  (typeof window !== 'undefined' ? (window as any).__VITE_API_URL__ : undefined) as string | undefined;

const RAW_BASE =
  (runtimeBase ?? (import.meta.env.VITE_API_URL as string | undefined))?.replace(/\/$/, '') || '';

// Defensive: if an older deploy set the wrong Render backend hostname, fix it client-side.
const normalizedHostBase = RAW_BASE.replace(
  /^https?:\/\/heyla-os-backend\.onrender\.com\/?/i,
  'https://heyla-backend.onrender.com',
);

// Some deployments accidentally set VITE_API_URL to include /api/v1.
// Normalize to ensure we call backend routes under /api/*.
const BASE = normalizedHostBase.replace(/\/api\/v1$/i, '/api');
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
    location.assign(isSafeRedirectUrl('/login') ? '/login' : '/');
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

    // Trial-gating: backend responds 403 { redirectToPayment: true, paymentUrl }
    if (res.status === 403 && (data as any)?.redirectToPayment) {
      const paymentUrl = (data as any).paymentUrl || '/payment';
      location.assign(isSafeRedirectUrl(paymentUrl) ? paymentUrl : '/');
    }

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
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ ok: true }>('POST', '/auth/change-password', { currentPassword, newPassword }),
    updateProfile: (data: { name?: string; company?: string; avatar?: string; facilityName?: string; facilityLogo?: string }) =>
      request<{ user: any }>('PATCH', '/auth/profile', data),
    googleLogin: (credential: string) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/google/login', { credential }),
    googleRegister: (data: { credential: string; accountType?: 'company' | 'individual'; facilityName?: string; facilityLogo?: string }) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/google/register', data),
    linkedinLogin: (accessToken: string) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/linkedin/login', { accessToken }),
    linkedinRegister: (accessToken: string) =>
      request<{ token: string; refreshToken: string; user: any }>('POST', '/auth/linkedin/register', { accessToken }),
  },

  subscription: {
    plans: () => request<{ plans: any[]; optionalModules: any[] }>('GET', '/subscription/plans'),
    status: () => request<{ subscription: any }>('GET', '/subscription/status'),
    subscribe: (plan: string, billingCycle: string) =>
      request<{ ok: true; subscription: any }>('POST', '/subscription/subscribe', { plan, billingCycle }),
    cancel: () => request<{ ok: true; subscription: any }>('POST', '/subscription/cancel'),
  },

  payment: {
    gateways: () => request<{ gateways: any[] }>('GET', '/payment/gateways'),
    initiateMpesa: (plan: string, billingCycle: string, phone: string) =>
      request<{ ok: true; reference: string; checkoutRequestId: string; customerMessage: string }>('POST', '/payment/initiate-mpesa', { plan, billingCycle, phone }),
    mpesaStatus: (checkoutRequestId: string) =>
      request<{ status: string; receipt?: string; reason?: string }>('POST', '/payment/mpesa-status', { checkoutRequestId }),
    initiateStripe: (plan: string, billingCycle: string) =>
      request<{ ok: true; reference: string; clientSecret: string; paymentIntentId: string }>('POST', '/payment/initiate-stripe', { plan, billingCycle }),
    initiatePaystack: (plan: string, billingCycle: string) =>
      request<{ ok: true; reference: string; authorizationUrl: string; accessCode: string }>('POST', '/payment/initiate-paystack', { plan, billingCycle }),
    verify: (reference: string) =>
      request<{ status: string; reference: string; amount: number; plan: string; billingCycle: string; gatewayType: string; mpesaReceipt?: string; failureReason?: string }>('POST', '/payment/verify', { reference }),
    history: () => request<{ transactions: any[] }>('GET', '/payment/history'),
  },

  public: {
    jobs: (countryCode?: string) => {
      const params = countryCode ? `?country=${countryCode}` : '';
      return request<{ id: string; title: string; company: string; location: string; type: string; salary: string; description: string; postedDate: string }[]>('GET', `/public/jobs${params}`);
    },
    vacancies: (q?: { search?: string; type?: string; country?: string; limit?: number; offset?: number }) => {
      const params = new URLSearchParams();
      if (q?.search) params.set('search', q.search);
      if (q?.type) params.set('type', q.type);
      if (q?.country) params.set('country', q.country);
      if (q?.limit) params.set('limit', String(q.limit));
      if (q?.offset) params.set('offset', String(q.offset));
      const qs = params.toString();
      return request<CareerJob[]>('GET', `/public/vacancies${qs ? `?${qs}` : ''}`);
    },
  },

  ntv: {
    profile: {
      get: () => api.get<any>('/ntv/profile'),
      update: (data: any) => api.put<any>('/ntv/profile', data),
      search: (q: string) => api.get<any>(`/ntv/profiles/search?q=${encodeURIComponent(q)}`),
      public: (userId: string) => api.get<any>(`/ntv/profiles/${userId}`),
    },
    feed: (limit = 10, offset = 0) =>
      api.get<any>(`/ntv/feed?limit=${limit}&offset=${offset}`),
    post: {
      create: (data: any) => api.post<any>('/ntv/posts', data),
      like: (postId: string) => api.post<any>(`/ntv/posts/${postId}/like`),
      comment: (postId: string, content: string) =>
        api.post<any>(`/ntv/posts/${postId}/comment`, { content }),
      save: (postId: string) => api.post<any>(`/ntv/posts/${postId}/save`),
      share: (postId: string) => api.post<any>(`/ntv/posts/${postId}/share`),
      delete: (postId: string) => api.post<any>(`/ntv/posts/${postId}/delete`),
    },
    project: {
      create: (data: any) => api.post<any>('/ntv/projects', data),
      list: () => api.get<any[]>('/ntv/projects'),
    },
    company: {
      list: () => api.get<any[]>('/ntv/companies'),
      get: (id: string) => api.get<any>(`/ntv/companies/${id}`),
      create: (data: any) => api.post<any>('/ntv/companies', data),
      update: (id: string, data: any) => api.put<any>(`/ntv/companies/${id}`, data),
    },
    job: {
      list: (params?: { type?: string; search?: string; county?: string; industry?: string; remote?: string }) => {
        const qs = new URLSearchParams(params as Record<string, string>).toString()
        return api.get<any[]>(`/ntv/jobs${qs ? `?${qs}` : ''}`)
      },
      get: (id: string) => api.get<any>(`/ntv/jobs/${id}`),
      create: (data: any) => api.post<any>('/ntv/jobs', data),
      update: (id: string, data: any) => api.put<any>(`/ntv/jobs/${id}`, data),
      apply: (jobId: string, data?: any) =>
        api.post<any>(`/ntv/jobs/${jobId}/apply`, data || {}),
      candidates: (jobId: string) => api.get<any>(`/ntv/jobs/${jobId}/candidates`),
    },
    candidates: {
      search: (params?: { skill?: string; availability?: string; q?: string }) => {
        const qs = new URLSearchParams(params as Record<string, string>).toString()
        return api.get<any[]>(`/ntv/candidates/search${qs ? `?${qs}` : ''}`)
      },
    },
    connection: {
      list: () => api.get<any[]>('/ntv/connections'),
      requests: () => api.get<any[]>('/ntv/connections/requests'),
      connect: (userId: string) => api.post<any>('/ntv/connections/connect', { userId }),
      accept: (id: string) => api.post<any>('/ntv/connections/accept', { id }),
      remove: (id: string) => api.post<any>('/ntv/connections/remove', { id }),
      suggestions: () => api.get<any[]>('/ntv/suggestions'),
    },
    follow: {
      toggle: (userId: string) => api.post<any>('/ntv/follow', { userId }),
    },
    conversation: {
      list: () => api.get<any[]>('/ntv/conversations'),
    },
    message: {
      send: (userId: string, content: string) =>
        api.post<any>(`/ntv/messages/${userId}`, { content }),
    },
    notification: {
      list: () => api.get<any[]>('/ntv/notifications'),
      markRead: (id: string) => api.post<any>(`/ntv/notifications/${id}/read`),
      unreadCount: () => api.get<any>('/ntv/notifications/unread-count'),
    },
  },

  network: {
    verifications: {
      list: () => api.get<any>('/network/verifications'),
      user: (userId: string) => api.get<any>(`/network/verifications/${userId}`),
      create: (data: any) => api.post<any>('/network/verifications', data),
      update: (id: string, data: any) => api.patch<any>(`/network/verifications/${id}`, data),
      remove: (id: string) => api.delete<any>(`/network/verifications/${id}`),
    },
    references: {
      list: () => api.get<any>('/network/references'),
      request: (data: any) => api.post<any>('/network/references/request', data),
      submit: (id: string, data: any) => api.post<any>(`/network/references/${id}/submit`, data),
      verify: (id: string) => api.post<any>(`/network/references/${id}/verify`),
    },
    worklog: {
      list: () => api.get<any>('/network/worklog'),
      create: (data: any) => api.post<any>('/network/worklog', data),
      remove: (id: string) => api.delete<any>(`/network/worklog/${id}`),
    },
    reputation: {
      mine: () => api.get<any>('/network/reputation'),
      user: (userId: string) => api.get<any>(`/network/reputation/${userId}`),
    },
    passport: {
      get: () => api.get<any>('/network/passport'),
      update: (data: any) => api.post<any>('/network/passport', data),
    },
    projects: {
      list: () => api.get<any[]>('/network/projects'),
      user: (userId: string) => api.get<any[]>(`/network/projects/${userId}`),
      create: (data: any) => api.post<any>('/network/projects', data),
      remove: (id: string) => api.delete<any>(`/network/projects/${id}`),
    },
    machines: {
      list: () => api.get<any[]>('/network/machines'),
      create: (data: any) => api.post<any>('/network/machines', data),
      remove: (id: string) => api.delete<any>(`/network/machines/${id}`),
    },
    endorse: (skillId: string) => api.post<any>(`/network/skills/${skillId}/endorse`),
    communities: {
      list: () => api.get<any>('/network/communities'),
      get: (id: string) => api.get<any>(`/network/communities/${id}`),
      create: (data: any) => api.post<any>('/network/communities', data),
      join: (id: string) => api.post<any>(`/network/communities/${id}/join`),
      leave: (id: string) => api.post<any>(`/network/communities/${id}/leave`),
      post: (id: string, data: any) => api.post<any>(`/network/communities/${id}/posts`, data),
      deletePost: (id: string, postId: string) => api.delete<any>(`/network/communities/${id}/posts/${postId}`),
      likePost: (id: string, postId: string) => api.post<any>(`/network/communities/${id}/posts/${postId}/like`),
      helpCreate: (id: string, data: any) => api.post<any>(`/network/communities/${id}/help`, data),
      helpOffer: (id: string, helpId: string, data: any) => api.post<any>(`/network/communities/${id}/help/${helpId}/offer`, data),
      helpResolve: (id: string, helpId: string) => api.post<any>(`/network/communities/${id}/help/${helpId}/resolve`),
    },
    events: {
      list: () => api.get<any>('/network/events'),
      create: (data: any) => api.post<any>('/network/events', data),
      register: (id: string) => api.post<any>(`/network/events/${id}/register`),
      checkin: (id: string) => api.post<any>(`/network/events/${id}/checkin`),
    },
    mentorship: {
      list: () => api.get<any>('/network/mentorship'),
      mentors: () => api.get<any[]>('/network/mentors'),
      request: (data: any) => api.post<any>('/network/mentorship/request', data),
      respond: (id: string, accept: boolean) => api.post<any>(`/network/mentorship/${id}/respond`, { accept }),
      progress: (id: string, data: any) => api.post<any>(`/network/mentorship/${id}/progress`, data),
    },
    matchedJobs: () => api.get<any>('/network/jobs/matched'),
    careerCoach: () => api.get<any>('/network/career-coach'),
    resume: (format: string) => api.post<any>('/network/resume/generate', { format }),
    recruiterSearch: (query: string) => api.post<any>('/network/recruiter/search', { query }),
  },

  admin: {
    auditLogs: (q?: { limit?: number; offset?: number; q?: string }) => {
      const params = new URLSearchParams(q as Record<string, string>).toString();
      return request<any[]>('GET', `/admin/audit-logs${params ? `?${params}` : ''}`);
    },
    users: () => request<any[]>('GET', '/admin/users'),
    createUser: (data: { email: string; name: string; password: string; role?: string; facilityName?: string; company?: string }) =>
      request<{ user: any }>('POST', '/admin/users/create', data),
    setRole: (id: string, role: string) => request<any>('PATCH', `/admin/users/${id}/role`, { role }),
    revokeSessions: (id: string) => request<{ ok: true }>('POST', `/admin/users/${id}/revoke-sessions`),
    resetPassword: (id: string, newPassword: string) =>
      request<{ ok: true }>('POST', `/admin/users/${id}/reset-password`, { newPassword }),
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
