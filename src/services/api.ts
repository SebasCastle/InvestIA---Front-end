import { toast } from 'sonner';
import { tokenStorage } from './token-storage';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = tokenStorage.get();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = readErrorMessage(body);
    notifyError(message);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function downloadFile(path: string, filename: string): Promise<void> {
  const headers = new Headers();
  const token = tokenStorage.get();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = readErrorMessage(body);
    notifyError(message);
    throw new ApiError(message, response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

let lastNotice = '';
let lastNoticeAt = 0;

export function notifyError(message: string): void {
  const now = Date.now();
  if (message === lastNotice && now - lastNoticeAt < 4000) {
    return;
  }
  lastNotice = message;
  lastNoticeAt = now;
  toast.error(message);
}

function readErrorMessage(body: unknown): string {
  if (!body || typeof body !== 'object' || !('message' in body)) {
    return 'No se pudo completar la solicitud';
  }

  const message = (body as { message: unknown }).message;
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message.filter((item) => typeof item === 'string').join('. ');
  }
  return 'No se pudo completar la solicitud';
}
