import { Routes } from '@angular/router';
import { MenuComponent } from './pages/menu/menu';
import { OrdersComponent } from './pages/orders/orders';
import { TablesComponent } from './pages/tables/tables';
import { UsersComponent } from './pages/users/users';


export const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'menu', component: MenuComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
