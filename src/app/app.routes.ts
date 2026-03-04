import { Routes } from '@angular/router';
import { MenuComponent } from './pages/menu/menu';
import { OrdersComponent } from './pages/orders/orders';
import { TablesComponent } from './pages/tables/tables';
import { UsersComponent } from './pages/users/users';
import { TableViewComponent } from './pages/tableViewSide/tableView';
import { ChefOrdersComponent } from './pages/chefViewSide/chef-view.component';


export const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'menu', component: MenuComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'tableview', component: TableViewComponent },
      { path: 'chefView', component: ChefOrdersComponent},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
