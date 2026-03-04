import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {

  constructor(private http: HttpClient) {}

  // ───────── CREATE ORDER ─────────

  createOrder(payload: {
    tableToken: string;
    items: { menuItemId: string; quantity: number }[];
  }) {
    return this.http.post<Order>(
      `${environment.host}/api/orders`,
      payload
    );
  }

  // ───────── UPDATE ORDER STATUS ─────────

  updateOrderStatus(id: string, status: string) {
    return this.http.patch<Order>(
      `${environment.host}/api/orders/${id}/status`,
      { status }
    );
  }

  // ───────── PAYMENT ACTIONS ─────────

  markAsPaid(id: string) {
    return this.http.patch<Order>(
      `${environment.host}/api/orders/${id}/pay`,
      {}
    );
  }

  markAsUnpaid(id: string) {
    return this.http.patch<Order>(
      `${environment.host}/api/orders/${id}/unpay`,
      {}
    );
  }

  // ───────── CHEF ORDERS ─────────

  getChefOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {

    const httpParams = new HttpParams({
      fromObject: { ...(params ?? {}) }
    });

    return this.http.get<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      data: Order[];
    }>(
      `${environment.host}/api/orders/chef`,
      { params: httpParams }
    );
  }

  // ───────── MANAGER ORDERS ─────────

  getManagerOrders(page: number = 1, limit: number = 10) {

    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http.get<{
      total: number;
      page: number;
      totalPages: number;
      data: Order[];
    }>(
      `${environment.host}/api/orders/manager`,
      { params }
    );
  }

  // ───────── ALL ORDERS (ADMIN) ─────────

  getOrders(filters?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {

    const params = new HttpParams({
      fromObject: { ...(filters ?? {}) }
    });

    return this.http.get<{
      total: number;
      page: number;
      totalPages: number;
      data: Order[];
    }>(
      `${environment.host}/api/orders`,
      { params }
    );
  }

}