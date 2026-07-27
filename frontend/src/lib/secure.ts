export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:image/') || url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/')) return url;
  return '';
}

export function sanitizeError(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}

export function isSafeRedirectUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  if (url.startsWith('https://heylaos.com')) return true;
  if (url.startsWith('https://hms.heylaos.com')) return true;
  if (url.startsWith('https://hydan.heylaos.com')) return true;
  if (url.startsWith('https://keylist.heylaos.com')) return true;
  return false;
}
