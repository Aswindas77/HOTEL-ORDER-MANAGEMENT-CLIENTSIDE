import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private baseUrl = `${environment.host}/api/admin/dashboard`;

  constructor(private http: HttpClient) { }

  getSummary() {
    return this.http.get<{
      totalMenus: number;
      totalOrders: number;
      pendingOrders: number;
      activeTables: number;
      totalUsers: number;
    }>(`${this.baseUrl}/summary`);
  }


  getOrderAnalytics(period?: 'week' | 'month', startDate?: string, endDate?: string) {

    let url = `${this.baseUrl}/order-analytics`;

    const params: any = {};

    if (period) params.period = period;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.http.get(url, { params });

  }


  getTableStatus() {
    return this.http.get<{
      free: number;
      occupied: number;
    }>(`${this.baseUrl}/table-status`);
  }

getRecentOrders() {
  return this.http.get<{
    id: string;
    item: string;
    table: string;
    qty: number;
    amount: number;
    status: string;
    time: string;
  }[]>(`${this.baseUrl}/recent-orders`);
}

getTopItems() {
  return this.http.get<{
    name: string;
    orders: number;
    revenue: number;
  }[]>(`${this.baseUrl}/top-items`);
}

getMenuBreakdown() {
  return this.http.get(`${this.baseUrl}/menu-breakdown`);
}


}