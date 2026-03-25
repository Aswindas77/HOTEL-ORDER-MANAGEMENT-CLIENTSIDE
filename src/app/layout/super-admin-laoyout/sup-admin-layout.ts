import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';
import { SuperAdminApiService } from '../../services/super-admin-api/super-admin-api.service';
import { SubscriptionExpiryApiService } from '../../pages/super-admin/subscription-expiry/service/subscription-expiry-api.service';
import { BranchRequestApiService } from '../../pages/super-admin/branch-requests/service/branch-request-api.service';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './sup-admin-layout.html',
  styleUrls: ['./sup-admin-layout.scss'],
})
export class SuperAdminLayoutComponent implements OnInit {

  // ── Display data ─────────────────────────────────────────────
  adminName = 'Aswin das';
  adminInitials = 'AS';
  totalHotels = 0;
  totalUsers = 0;
  pendingCount = 0;
  expiringCount = 0;
  hasNotifications = true;

  // ── Dropdown state ───────────────────────────────────────────
  /** Which nav dropdown is currently open; null = none */
  activeDropdown: string | null = null;

  /** Whether the profile dropdown is visible */
  showProfileMenu = false;

  private closeTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  constructor(
    private authApi: AuthApiService,
    private router: Router,
    private superAdminApi: SuperAdminApiService,
    private expiryApi: SubscriptionExpiryApiService,
    private branchRequestApi: BranchRequestApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.adminInitials = this.adminName
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    this.loadHotelsCount();        // ✅ ONLY hotels
    this.loadExpiringCount();
    this.loadUsersCount();
    this.loadPendingRequestsCount();
  }


  loadHotelsCount(): void {
    this.superAdminApi.getHotels().subscribe((res: any) => {
      console.log('Hotels:', res);

      this.totalHotels = res?.total || 0;   // ✅ ALWAYS use total
      this.cdr.detectChanges();
    });
  }

  loadExpiringCount(): void {
    this.expiryApi.getExpiringSubscriptions().subscribe((res: any) => {

      const subscriptions = res?.data || res || [];

      this.expiringCount = subscriptions.filter((s: any) => {
        const days = this.getDaysLeft(s.expiryDate);
        return days > 0 && days <= 4;
      }).length;
      this.cdr.detectChanges();
    });
  }

  getDaysLeft(expiryDate: string): number {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

loadUsersCount(): void {
  this.superAdminApi.getUsers(1, 1000).subscribe((res: any) => {

    const users = res?.data || res || [];

    // ✅ SAME LOGIC AS USER MANAGEMENT
    const managerUsers = users.filter((u: any) =>
      u.role === 'MANAGER' &&
      (u.isActive === true || u.isActive === 'true')
    );

    this.totalUsers = managerUsers.length;

    this.cdr.detectChanges();

  });
}


loadPendingRequestsCount(): void {
  this.branchRequestApi.getRequests(1, 1000).subscribe((res: any) => {

    const requests = res?.data || res || [];

    console.log('Requests:', requests); // debug

    this.pendingCount = requests.filter((r: any) =>
      r.status?.toLowerCase() === 'pending'
    ).length;

    this.cdr.detectChanges();

  });
}


  // ── Nav blur helper ──────────────────────────────────────────
  /**
   * Returns true when any dropdown is open.
   * Used in the template to toggle the `has-open` class on .sa-nb-nav,
   * which triggers the CSS blur/dim on all non-active sibling triggers.
   */
  get hasOpenDropdown(): boolean {
    return this.activeDropdown !== null;
  }

  // ── Navigation dropdown helpers ──────────────────────────────

  /** Open a named dropdown immediately, cancelling any pending close timer */
  openMenu(name: string): void {
    if (this.closeTimers[name]) {
      clearTimeout(this.closeTimers[name]);
      delete this.closeTimers[name];
    }
    this.activeDropdown = name;
  }

  /**
   * Schedule closing a named dropdown with a short delay so the mouse
   * can travel from trigger → mega-panel without flickering.
   */
  scheduleClose(name: string): void {
    this.closeTimers[name] = setTimeout(() => {
      if (this.activeDropdown === name) {
        this.activeDropdown = null;
      }
    }, 130);
  }

  /** Close all dropdowns instantly (e.g. after a navigation click) */
  closeMenus(): void {
    Object.values(this.closeTimers).forEach(t => clearTimeout(t));
    this.closeTimers = {};
    this.activeDropdown = null;
    this.showProfileMenu = false;
  }

  // ── Profile dropdown ─────────────────────────────────────────

  toggleProfile(): void {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) {
      this.activeDropdown = null;   // close nav dropdowns when profile opens
    }
  }

  // ── Close-on-outside-click ───────────────────────────────────

  /** Dismiss all overlays when clicking outside the navbar */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.sa-navbar')) {
      this.closeMenus();
    }
  }

  /** Close everything on Escape */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }

  // ── Router hooks ─────────────────────────────────────────────

  onPageActivate(_component: unknown): void {
    this.closeMenus();
  }

  onPageClick(): void {
    this.closeMenus();
  }

  // ── Search / Notifications ───────────────────────────────────

  openSearch(): void {
    // Connect to your command-palette / search modal here
    console.log('Open search');
  }

  openNotifications(): void {
    // Connect to your notifications drawer here
    console.log('Open notifications');
  }

  // ── Auth ─────────────────────────────────────────────────────

  logout(): void {
    this.closeMenus();
    this.authApi.logout();
    this.router.navigate(['/login']);
  }
}