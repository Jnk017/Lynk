const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.lynkapp.com/api/v1';

export async function lynkApi(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Lynk-Channel': 'pi',
      ...(init.headers || {}),
    },
  });
}
