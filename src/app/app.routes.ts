import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MenuComponent } from './pages/menu/menu.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { TablesComponent } from './pages/tables/tables.component';
import { UsersComponent } from './pages/users/users.component';
import { TableViewComponent } from './pages/tableViewSide/tableView';
import { ChefOrdersComponent } from './pages/chefViewSide/chef-view.component';
import { HotelsComponent } from './pages/super-admin/hotel management/hotels.component';
import { BranchRequestsComponent } from './pages/super-admin/branch-requests/branch-requests.component';

import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login.component';
import { SuperAdminLayoutComponent } from './layout/super-admin-laoyout/sup-admin-layout';
import { UserManagementComponent } from './pages/super-admin/user-management/user-management';
import { MenuCardManagementComponent } from './pages/super-admin/menu-card-management/menu-card-management';
import { PurchaseApprovalComponent } from './pages/super-admin/purchase-approval/purchase-approval';
import { LoginGuard } from './guards/login.guard';
import { AnalyticsComponent } from './pages/super-admin/analytics/analytics.component';
import { SubscriptionExpiryComponent } from './pages/super-admin/subscription-expiry/subscription-expiry.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },

  { path: 'tableview', component: TableViewComponent },
  { path: 'chefView', component: ChefOrdersComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
  path: 'super-admin',
  component: SuperAdminLayoutComponent,
  canActivate: [AuthGuard],
  children: [

    {
  path: 'subscription-expiry',
  component: SubscriptionExpiryComponent
},
    { path: 'analytics', component: AnalyticsComponent },
    { path:'hotels', component:HotelsComponent },
    { path: 'branch-requests',component: BranchRequestsComponent},
    { path: 'user-management', component: UserManagementComponent },
    { path: 'menu-cards', component: MenuCardManagementComponent },
    { path: 'purchase-approvals', component: PurchaseApprovalComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

  ]
},

  { path: '', redirectTo: 'tableview', pathMatch: 'full' },
  { path: '**', redirectTo: 'tableview' }

];