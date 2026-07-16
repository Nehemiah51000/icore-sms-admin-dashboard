import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

interface ErrorResponseBody {
  message?: string;
  errors?: Record<string, string[]>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('icore_admin_token');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = body as ErrorResponseBody | null;

    // A 401 while we believed we were authenticated means the token expired
    // or was revoked server-side — force a clean logout and send the user
    // back to login. Deliberately scoped to `token` being present, so a 401
    // from the login attempt itself (wrong credentials, no token yet) is
    // left alone for LoginPage's own error handling to deal with.
    if (res.status === 401 && token) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1');
      }
    }

    throw new ApiError(
      res.status,
      errorBody?.message ?? 'Something went wrong.',
      errorBody?.errors,
    );
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
