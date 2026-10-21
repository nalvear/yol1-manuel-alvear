import { request } from './client';
import type { LoginRequest, LoginResponse, ScoreResponse } from './types';

export const login = (credentials: LoginRequest) =>
  request<LoginResponse>('/login', { method: 'POST', body: credentials });

export const fetchScore = (rut: string, token: string) =>
  request<ScoreResponse>(`/score/${encodeURIComponent(rut)}`, { token });
