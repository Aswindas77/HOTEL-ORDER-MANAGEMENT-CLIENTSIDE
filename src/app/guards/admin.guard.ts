import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthApiService } from '../services/auth-api.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  constructor(
    private authApi: AuthApiService,
    private router: Router
  ) {}

  canActivate(): boolean {

    const token = this.authApi.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {

      const decoded: any = jwtDecode(token);

      if (decoded.role === 'ADMIN') {
        return true;
      }

      this.router.navigate(['/unauthorized']);
      return false;

    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}