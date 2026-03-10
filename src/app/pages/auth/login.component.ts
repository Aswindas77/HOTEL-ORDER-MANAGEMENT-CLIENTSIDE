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
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  login() {

    this.loading = true;

    this.authApi.login(this.loginData).subscribe({
      next: (res: any) => {

        localStorage.setItem('token', res.accessToken);

        if (res.user.role === 'MANAGER') {
          this.router.navigate(['/admin/dashboard']);
        }

        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/super-admin']);
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
      next: () => {
        alert("Registration successful");
        this.isLoginMode = true;
        this.loading = false;
      },
      error: (err) => {
        alert(err.error.message);
        this.loading = false;
      }
    });
  }
}