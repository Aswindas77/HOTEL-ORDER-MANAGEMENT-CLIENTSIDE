import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiService {

  constructor(private http: HttpClient) {}

  // POST /auth/login
  login(payload: { email: string; password: string }) {
    return this.http.post(
      `${environment.host}/auth/login`,
      payload
    );
  }

  // GET /auth/profile (optional but useful)
  getProfile() {
    return this.http.get(
      `${environment.host}/auth/profile`
    );
  }

  // ---------- TOKEN HELPERS ----------

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}