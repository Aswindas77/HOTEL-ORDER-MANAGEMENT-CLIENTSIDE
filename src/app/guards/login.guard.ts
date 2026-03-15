import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const LoginGuard: CanActivateFn = () => {

  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (authApi.isLoggedIn()) {

    const role = authApi.getUserRole();
    const status = authApi.getActivationStatus(); 

    // SUPER ADMIN
    if (role === 'ADMIN') {
      router.navigate(['/super-admin/dashboard']);
      return false;
    }

    // MANAGER FLOW
    if (role === 'MANAGER') {

      if (status === 'pending') {
        router.navigate(['/waiting-approval']);
        return false;
      }

      if (status === 'approved') {
        router.navigate(['/admin/dashboard']);
        return false;
      }

      if (status === 'rejected') {
        router.navigate(['/setup']);
        return false;
      }

    }

  }

  return true;
};