import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sup-admin-layout.html',
  styleUrls: ['./sup-admin-layout.scss']
})
export class SuperAdminLayoutComponent {
    constructor(
    private authApi: AuthApiService,
    private router: Router,
  ) {}

  logout() {
    this.authApi.logout();     
    this.router.navigate(['/login']);
  }
}