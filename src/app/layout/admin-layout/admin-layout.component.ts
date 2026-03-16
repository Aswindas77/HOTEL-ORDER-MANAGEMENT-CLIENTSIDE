import { Component, OnInit, OnDestroy, HostListener, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],


  encapsulation: ViewEncapsulation.None,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  
  activeDropdown: string | null = null;


  adminInitials = 'AM';


  adminName = 'Admin Manager';


  liveOrderCount = 12;


  notificationCount = 3;


  showProfileMenu = false;


  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private routerSub!: Subscription;

  constructor(
    private authApi: AuthApiService,
    private router: Router,
  ) { }



  ngOnInit(): void {
  
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.activeDropdown = null;
        this.showProfileMenu = false; 
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

 
  openMenu(key: string): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
    this.activeDropdown = key;
  }

 
  closeMenu(key: string): void {
    this.closeTimer = setTimeout(() => {
      if (this.activeDropdown === key) {
        this.activeDropdown = null;
      }
    }, 100);
  }

  
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.activeDropdown = null;
    this.showProfileMenu = false; 
  }

 
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.al-navbar')) {
      this.activeDropdown = null;
      this.showProfileMenu = false; 
    }
   
    if (!(e.target as HTMLElement).closest('.al-profile-wrapper')) {
      this.showProfileMenu = false;
    }
  }

  onPageActivate(component: any): void {
    const loaders = [
      'loadDashboard',
      'loadMenus',
      'loadOrders',
      'loadTables',
      'loadUsers',
      'loadReports',
      'loadInventory',
    ];

    loaders.forEach(method => {
      if (typeof component[method] === 'function') {
        component[method]();
      }
    });

    const el = document.querySelector('.al-page-content');
    el ? el.scrollTo({ top: 0, behavior: 'smooth' }) : window.scrollTo(0, 0);
  }

 

  logout(): void {
    this.authApi.logout();
    this.router.navigate(['/login']);
  }

  openSearch(): void {
    
    console.log('Search opened (⌘K)');
  }

  openNotifications(): void {
    
    console.log('Notifications opened');
  }

 
  openProfile(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }
}