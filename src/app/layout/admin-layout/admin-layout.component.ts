import { Component, OnInit, OnDestroy, HostListener, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd, } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthApiService } from '../../services/auth-api.service';
import { MenuApiService } from '../../pages/menu/service/menu-api.service';
import { OrderApiService } from '../../services/order-api-services';
import { OrderStatus } from '../../enums/order-status.enum';
import { TableApiService } from '../../pages/tables/service/table-api.service';
import { HotelApiService } from '../../services/hotel-api.service';
import { ChangeDetectorRef } from '@angular/core';
import { UserApiService } from '../../pages/users/service/user-api.service';

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


  adminName = 'Loading...';
  hotelName = 'Loading...';

  liveOrderCount = 0;
  pendingOrderCount = 0;

  totalTables = 0;
  occupiedTables = 0;
  occupancyRate = 0;


  notificationCount = 3;


  showProfileMenu = false;
  menuActiveCount = 0;
  menuTotalCount = 0;




  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private routerSub!: Subscription;

  constructor(
    private authApi: AuthApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private menuApi: MenuApiService,
    private orderApi: OrderApiService,
    private tableApi: TableApiService,
    private hotelApi: HotelApiService,
    private userApi: UserApiService,

  ) { }



  ngOnInit(): void {


    this.loadMenuCounts();
    this.loadOrderCounts();
    this.loadTableCounts();
    this.loadHotel();

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


  loadMenuCounts(): void {
    this.menuApi.getAdminMenus().subscribe({
      next: (menus: any[]) => {
        this.menuTotalCount = menus.length;

        this.menuActiveCount = menus.filter(m => m.isAvailable).length;
      },
      error: () => {
        this.menuTotalCount = 0;
        this.menuActiveCount = 0;
      }
    });
  }


  loadOrderCounts(): void {

      const token = this.authApi.getToken();

  let branchId = '';

  if (token) {
    const decoded: any = JSON.parse(atob(token.split('.')[1]));
    branchId = decoded.branchId;
  }
    this.orderApi.getOrders({ limit: 10000,branchId: branchId}).subscribe({
      next: (res) => {
        const orders = res?.data || [];

        
        this.liveOrderCount = orders.filter(o =>
          o.status !== OrderStatus.COMPLETED
        ).length;

        
        this.pendingOrderCount = orders.filter(o =>
          o.status === OrderStatus.PENDING
        ).length;
      },
      error: () => {
        this.liveOrderCount = 0;
        this.pendingOrderCount = 0;
      }
    });
  }


  loadTableCounts(): void {
    this.tableApi.getTables(1, 1000).subscribe({
      next: (res) => {
        const tables = res?.data || [];

        this.totalTables = tables.length;

        this.occupiedTables = tables.filter(t =>
          t.status?.toLowerCase() === 'occupied'
        ).length;

        this.occupancyRate = this.totalTables
          ? Math.round((this.occupiedTables / this.totalTables) * 100)
          : 0;

        //  SAFE detect
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }
    });
  }

loadHotel(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    this.hotelName = 'My Hotel';
    return;
  }

  
  const decoded: any = JSON.parse(atob(token.split('.')[1]));

  const userId =
    decoded?.userId ||
    decoded?._id ||
    decoded?.sub ||
    decoded?.id;

  if (!userId) {
    this.hotelName = 'My Hotel';
    return;
  }

  
  this.userApi.getUserById(userId).subscribe({
    next: (user: any) => {
      console.log('USER:', user);

      this.adminName = user?.name || 'Admin';

      const hotelId = user?.hotelId;

      if (!hotelId) {
        this.hotelName = 'My Hotel';
        return;
      }

      
      this.hotelApi.getHotelById(hotelId).subscribe({
        next: (hotel: any) => {
          console.log('HOTEL:', hotel);

          this.hotelName = hotel?.name || 'My Hotel';

          this.cdr.detectChanges();
        },
        error: () => {
          this.hotelName = 'My Hotel';
          this.cdr.detectChanges();
        }
      });
    },
    error: () => {
      this.hotelName = 'My Hotel';
      this.cdr.detectChanges();
    }
  });
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