import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MenuComponent } from './pages/menu/menu.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { TablesComponent } from './pages/tables/tables.component';
import { UsersComponent } from './pages/users/users.component';
import { TableViewComponent } from './pages/tableViewSide/tableView';
import { ChefOrdersComponent } from './pages/chefViewSide/chef-view.component';


export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'menu',
        component: MenuComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'orders',
        component: OrdersComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'tables',
        component: TablesComponent,
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'users',
        component: UsersComponent,
        runGuardsAndResolvers: 'always'
      },
      { path: 'tableview', component: TableViewComponent },
      { path: 'chefView', component: ChefOrdersComponent},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ],
  },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' }
];
// export const routes: Routes = [
//   {
//     path: 'admin',
//     component: AdminLayoutComponent,
//     children: [
//       { path: 'dashboard', component: DashboardComponent },
//       { path: 'menu', component: MenuComponent },
//       { path: 'orders', component: OrdersComponent },
//       { path: 'tables', component: TablesComponent },
//       { path: 'users', component: UsersComponent },
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
//     ],
//   },
//   { path: '', redirectTo: 'admin', pathMatch: 'full' },
//   { path: '**', redirectTo: 'admin' }
// ];