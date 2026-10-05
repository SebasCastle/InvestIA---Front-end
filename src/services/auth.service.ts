import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';
import { api } from './api';

export const authService = {
  login(payload: LoginPayload) {
    return api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: RegisterPayload) {
    return api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  me() {
    return api<User>('/auth/me');
  },
};
