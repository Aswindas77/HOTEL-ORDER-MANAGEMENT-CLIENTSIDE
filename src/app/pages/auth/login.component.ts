import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  isLoginMode = true;
  loading = false;

  // UI state for password visibility toggles
  showPwd    = false;
  showRegPwd = false;

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private authApi: AuthApiService,
    private router: Router
  ) { }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    // Reset visibility flags when switching modes
    this.showPwd    = false;
    this.showRegPwd = false;
  }

  login() {

    this.loading = true;

    this.authApi.login(this.loginData).subscribe({

      next: (res: any) => {

        // save JWT token
        localStorage.setItem('token', res.accessToken);

        // ADMIN LOGIN
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/super-admin']);
          this.loading = false;
          return;
        }

        // MANAGER LOGIN
        if (res.user.role === 'MANAGER') {

          const onboarding = res?.onboarding || {};

          // HOTEL NOT CREATED
          if (!onboarding.hotelCreated) {
            this.router.navigate(['/setup']);
            this.loading = false;
            return;
          }

          // BRANCH NOT CREATED
          if (onboarding.branchCount === 0) {
            this.router.navigate(['/setup']);
            this.loading = false;
            return;
          }

          // SUBSCRIPTION NOT CREATED
          if (!onboarding.subscriptionCreated) {
            this.router.navigate(['/setup']);
            this.loading = false;
            return;
          }

          // WAITING FOR ADMIN APPROVAL
          if (onboarding.activationStatus === 'pending') {
            this.router.navigate(['/waiting-approval']);
            this.loading = false;
            return;
          }

          // APPROVED → DASHBOARD
          if (onboarding.activationStatus === 'approved') {
            this.router.navigate(['/admin/dashboard']);
            this.loading = false;
            return;
          }

        }

        this.loading = false;

      },

      error: (err) => {
        alert(err.error.message);
        this.loading = false;
      }

    });

  }

  register() {

    this.loading = true;

    this.authApi.register(this.registerData).subscribe({

      next: (res: any) => {

        this.loading = false;

        localStorage.setItem('token', res.accessToken);

        this.router.navigate(['/setup']);

      },

      error: (err) => {
        alert(err.error.message);
        this.loading = false;
      }

    });

  }

}