import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  constructor(
    private authApi: AuthApiService,
    private router: Router
  ) { }

  onPageActivate(component: any) {

    if (component.loadMenus) {
      component.loadMenus();
    }

    if (component.loadDashboard) {
      component.loadDashboard();
    }

    window.scrollTo(0, 0);
  }

  logout() {
    this.authApi.logout();
    this.router.navigate(['/login']);
  }


}