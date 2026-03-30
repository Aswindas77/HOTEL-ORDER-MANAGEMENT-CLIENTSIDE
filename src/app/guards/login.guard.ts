import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const LoginGuard: CanActivateFn = () => {

  const authApi = inject(AuthApiService);
  const router = inject(Router);

  if (!authApi.isLoggedIn()) {
    return true;
  }

  const role = authApi.getUserRole();
  const user = authApi.getUser(); 

  
  if (role === 'ADMIN') {
    router.navigate(['/super-admin/dashboard']);
    return false;
  }

  
  if (role === 'MANAGER') {

    const step = user?.setupStep || 1;

    
    if (step <= 4) {
      router.navigate(['/setup']);
      return false;
    }

    if (step === 5) {
      router.navigate(['/waiting-approval']);
      return false;
    }

    if (step === 6) {

      
      if (!user.hotelId || !user.branchId) {
        router.navigate(['/setup']);
        return false;
      }

      router.navigate(['/admin/dashboard']);
      return false;
    }
  }

  return true;
};