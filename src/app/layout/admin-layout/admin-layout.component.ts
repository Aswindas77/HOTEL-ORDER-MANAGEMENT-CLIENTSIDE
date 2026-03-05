import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink,RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {


  onPageActivate(component: any) {

    // child component il load function undengil call cheyyum
    if (component.loadMenus) {
      component.loadMenus();
    }

    if (component.loadDashboard) {
      component.loadDashboard();
    }

    window.scrollTo(0,0);
  }

  
}