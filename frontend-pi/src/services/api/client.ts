const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.lynkapp.com/api/v1';

export async function lynkApi(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  headers.set('X-Lynk-Channel', 'pi');

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
}
