import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const LoginGuard: CanActivateFn = () => {

  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (authApi.isLoggedIn()) {

    const role = authApi.getUserRole();

    if (role === 'MANAGER') {
      router.navigate(['/admin/dashboard']);
    }

    if (role === 'ADMIN') {
      router.navigate(['/super-admin/dashboard']);
    }

    return false;
  }

  return true;
};