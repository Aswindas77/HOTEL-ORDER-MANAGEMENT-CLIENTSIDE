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
import { SetupHotelComponent } from './pages/setupHotel/setup-hotel.component';
import { ActivationPendingComponent } from './pages/activation-pending/activation-pending.component';
import { AnalyticsComponent } from './pages/super-admin/analytics/analytics.component';
import { SubscriptionExpiryComponent } from './pages/super-admin/subscription-expiry/subscription-expiry.component';
import { ComingSoonComponent } from './pages/comming soon/coming-soon.component';

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
    { path: 'users', component: UsersComponent },


    {
      path: 'menu',
      children: [
        { path: '', component: MenuComponent },
        { path: 'all', component: MenuComponent, data: { title: 'All Menu Items' } },
        { path: 'categories', component: MenuComponent, data: { title: 'Categories' } },
        { path: 'add', component: MenuComponent, data: { title: 'Add Menu Item' } },
        { path: 'offers', component: ComingSoonComponent, data: { title: 'Special Offers' } }
      ]
    },

 
    {
      path: 'orders',
      children: [
        { path: '', component: OrdersComponent },
        { path: 'live', component: OrdersComponent, data: { title: 'Live Orders' } },
        { path: 'history', component: OrdersComponent, data: { title: 'Order History' } },
        { path: 'pending', component: OrdersComponent, data: { title: 'Pending Orders' } },
        { path: 'new', component: OrdersComponent, data: { title: 'New Order' } }
      ]
    },

  
    {
      path: 'tables',
      children: [
        { path: '', component: TablesComponent },
        { path: 'floor', component: TablesComponent, data: { title: 'Floor Plan' } },
        { path: 'reservations', component: ComingSoonComponent, data: { title: 'Reservations' } }
      ]
    },

    {
      path: 'reports',
      children: [
        { path: '', component: ComingSoonComponent, data: { title: 'Reports Overview' } },
        { path: 'daily', component: ComingSoonComponent, data: { title: 'Daily Summary' } },
        { path: 'revenue', component: ComingSoonComponent, data: { title: 'Revenue Analytics' } },
        { path: 'items', component: ComingSoonComponent, data: { title: 'Item Performance' } },
        { path: 'export', component: ComingSoonComponent, data: { title: 'Export Reports' } }
      ]
    },

    {
      path: 'settings',
      children: [
        { path: '', component: ComingSoonComponent, data: { title: 'General Settings' } },
        { path: 'profile', component: ComingSoonComponent, data: { title: 'Profile Settings' } },
        { path: 'billing', component: ComingSoonComponent, data: { title: 'Billing' } },
        { path: 'notifications', component: ComingSoonComponent, data: { title: 'Notifications' } },
        { path: 'integrations', component: ComingSoonComponent, data: { title: 'Integrations' } }
      ]
    },

    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

  ]
},

  {
  path: 'super-admin',
  component: SuperAdminLayoutComponent,
  canActivate: [AuthGuard],
  children: [

   
    { path: 'analytics', component: AnalyticsComponent },
    { path: 'branch-requests', component: BranchRequestsComponent },
    { path: 'purchase-approvals', component: PurchaseApprovalComponent },
    { path: 'subscription-expiry', component: SubscriptionExpiryComponent },

  
    {
      path: 'hotels',
      children: [
        { path: '', component: HotelsComponent },
        { path: 'onboard', component: ComingSoonComponent, data: { title: 'Onboard Hotel' } },
        { path: 'performance', component: ComingSoonComponent, data: { title: 'Hotel Performance' } }
      ]
    },

    {
      path: 'user-management',
      children: [
        { path: '', component: UserManagementComponent },
        { path: 'roles', component: UserManagementComponent, data: { title: 'Roles & Permissions' } },
        { path: 'invite', component: ComingSoonComponent, data: { title: 'Invite User' } }
      ]
    },


    {
      path: 'profile',
      component: ComingSoonComponent,
      data: { title: 'My Profile' }
    },

    {
      path: 'menu-cards',
      component: ComingSoonComponent,
      data: { title: 'Plans & Subscription' }
    },

    {
      path: 'reports',
      children: [
        { path: '', component: ComingSoonComponent, data: { title: 'Platform Overview' } },
        { path: 'revenue', component: ComingSoonComponent, data: { title: 'Revenue Analytics' } },
        { path: 'benchmarks', component: ComingSoonComponent, data: { title: 'Hotel Benchmarks' } },
        { path: 'export', component: ComingSoonComponent, data: { title: 'Export Reports' } }
      ]
    },

    {
      path: 'settings',
      children: [
        { path: '', component: ComingSoonComponent, data: { title: 'General Settings' } },
        { path: 'billing', component: ComingSoonComponent, data: { title: 'Billing & Subscription' } },
        { path: 'integrations', component: ComingSoonComponent, data: { title: 'Integrations' } },
        { path: 'audit', component: ComingSoonComponent, data: { title: 'Audit Logs' } }
      ]
    },


    { path: '', redirectTo: 'analytics', pathMatch: 'full' }

  ]
},

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'tableview' }

];