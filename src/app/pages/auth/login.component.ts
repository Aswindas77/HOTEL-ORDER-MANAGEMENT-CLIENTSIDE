import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { jwtDecode } from 'jwt-decode';
import { ToastService } from '../../services/toast';


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

 
  showPwd = false;
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
    private router: Router,
    private toast: ToastService
  ) { }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.showPwd = false;
    this.showRegPwd = false;
  }

  login() {

    this.loading = true;

    this.authApi.login(this.loginData).subscribe({

      next: (res: any) => {

        localStorage.setItem('token', res.accessToken);


        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/super-admin']);
          this.loading = false;
          return;
        }

        if (res.user.role === 'MANAGER') {

          const decoded: any = jwtDecode(res.accessToken);
          const step = decoded.setupStep || 1;

          if (step <= 4) {
            this.router.navigate(['/setup']);
            this.loading = false;
            return;
          }

          if (step === 5) {
            this.router.navigate(['/waiting-approval']);
            this.loading = false;
            return;
          }

          if (step === 6) {
            this.router.navigate(['/admin/dashboard']);
            this.loading = false;
            return;
          }

        }

        this.loading = false;

      },

      error: (err) => {
        this.toast.show(err.error.message, 'error');
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
        this.toast.show(err.error.message, 'error');
        this.loading = false;
      }

    });

  }

}