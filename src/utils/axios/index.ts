import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_DOMAIN || ''}/api/v1`
});

export function extractErrorMessage(err: unknown, defaultMessage = 'Request failed'): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<{ message?: string; error?: string }>;
    return e.response?.data?.message ?? e.response?.data?.error ?? e.message ?? defaultMessage;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export default api;


