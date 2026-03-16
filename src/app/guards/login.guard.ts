import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';
import { jwtDecode } from 'jwt-decode';

export const LoginGuard: CanActivateFn = () => {

  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (authApi.isLoggedIn()) {

    const role = authApi.getUserRole();

    // ADMIN
    if (role === 'ADMIN') {
      router.navigate(['/super-admin/dashboard']);
      return false;
    }

    // MANAGER FLOW
    if (role === 'MANAGER') {

      const token = authApi.getToken();
      if (!token) return true;

      const decoded: any = jwtDecode(token);
      const step = decoded.setupStep || 1;
console.log("stepppp",step)
      if (step <= 4) {
        router.navigate(['/setup']);
        return false;
      }

      if (step === 5) {
        router.navigate(['/waiting-approval']);
        return false;
      }

      if (step === 6) {
        router.navigate(['/admin/dashboard']);
        return false;
      }

    }

  }

  return true;
};