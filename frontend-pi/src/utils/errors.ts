import { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'string' && message.trim()) return message;
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}
