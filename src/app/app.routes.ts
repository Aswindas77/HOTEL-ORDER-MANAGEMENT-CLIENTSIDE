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
import { SuperAdminDashboardComponent } from './pages/super-admin/dashboard/dashboard';
import { UserManagementComponent } from './pages/super-admin/user-management/user-management';
import { MenuCardManagementComponent } from './pages/super-admin/menu-card-management/menu-card-management';
import { PurchaseApprovalComponent } from './pages/super-admin/purchase-approval/purchase-approval';
import { LoginGuard } from './guards/login.guard';
import { SetupHotelComponent } from './pages/setupHotel/setup-hotel.component';
import { ActivationPendingComponent } from './pages/activation-pending/activation-pending.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },

  { path: 'tableview', component: TableViewComponent },
  { path: 'chefView', component: ChefOrdersComponent },

  {
  path: 'setup',
  component: SetupHotelComponent,
  canActivate: [AuthGuard],
  
},
{
  path: 'waiting-approval',
  component: ActivationPendingComponent,
  canActivate: [AuthGuard]
},


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

    { path: 'dashboard', component: SuperAdminDashboardComponent },
    { path:'hotels', component:HotelsComponent },
    { path: 'branch-requests',component: BranchRequestsComponent},
    { path: 'user-management', component: UserManagementComponent },
    { path: 'menu-cards', component: MenuCardManagementComponent },
    { path: 'purchase-approvals', component: PurchaseApprovalComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

  ]
},

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'tableview' }

];