import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private baseUrl = `${environment.host}/api/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<{
      totalMenus: number;
      totalOrders: number;
      pendingOrders: number;
      activeTables: number;
      totalUsers: number;
    }>(`${this.baseUrl}/summary`);
  }
}