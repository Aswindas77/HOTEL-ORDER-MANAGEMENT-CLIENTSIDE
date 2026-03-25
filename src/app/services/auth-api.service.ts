import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthApiService {

  constructor(private http: HttpClient) { }

  login(payload: any) {
    return this.http.post(`${environment.host}/api/auth/login`, payload);
  }

  register(payload: any) {
    return this.http.post(`${environment.host}/api/auth/register`, payload);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getUserRole(): string | null {

    const token = this.getToken();

    if (!token) return null;

    const decoded: any = jwtDecode(token);

    return decoded.role;
  }

  getActivationStatus(): string | null {

    const token = this.getToken();
    if (!token) return null;

    const decoded: any = jwtDecode(token);

    return decoded.activationStatus;

  }

  getProfile() {
    return this.http.get(`${environment.host}/api/auth/me`);
  }

  updateSetupStep(step: number, hotelId?: string) {

    const payload: any = {
      setupStep: step
    };

    if (hotelId) {
      payload.hotelId = hotelId;
    }

    return this.http.patch(`${environment.host}/api/auth/setup-step`, payload);

  }

  getUser(): any {
    const token = this.getToken();
    if (!token) return null;

    return jwtDecode(token);
  }

  getBranchId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded: any = jwtDecode(token);
    return decoded.branchId || null;
  }

}