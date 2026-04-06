/**
 * İstemci tarafı API tabanı.
 * Canlı sunucuda NEXT_PUBLIC_API_URL genelde `https://kavimobilya.com` olur;
 * endpoint'ler `/api/...` olduğu için sonuna `/api` eklenir.
 */
export function getPublicApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!raw) return '/api';
  const base = raw.replace(/\/$/, '');
  if (base.startsWith('http') && !/\/api$/.test(base)) {
    return `${base}/api`;
  }
  return base;
}
