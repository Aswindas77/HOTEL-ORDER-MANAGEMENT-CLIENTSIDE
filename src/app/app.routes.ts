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

  { path: 'tableview', component: TableViewComponent },
  { path: 'chefView', component: ChefOrdersComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'tableview', pathMatch: 'full' },
  { path: '**', redirectTo: 'tableview' }

];
