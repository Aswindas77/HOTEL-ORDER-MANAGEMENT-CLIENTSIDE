import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {

  constructor(private http: HttpClient) { }


  createOrder(payload: {
    tableToken: string;
    items: { menuItemId: string; quantity: number }[];
  }) {
    return this.http.post<Order>(
      `${environment.host}/api/orders`,
      payload
    );
  }


  updateOrderStatus(id: string, status: string, branchId: string) {
    return this.http.patch<Order>(
      `${environment.host}/api/orders/${id}/status?branchId=${branchId}`,
      { status }
    );
  }


  markAsPaid(id: string, branchId: string) {
    return this.http.patch<Order>(
      `${environment.host}/api/orders/${id}/pay?branchId=${branchId}`,
      {}
    );
  }

  markAsUnpaid(id: string, branchId: string) {
    return this.http.patch<Order>(
      `${environment.host}/api/orders/${id}/unpay?branchId=${branchId}`,
      {}
    );
  }


  getChefOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    branchId?: string;
  }) {

    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.branchId) httpParams = httpParams.set('branchId', params.branchId);

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


  getManagerOrders(branchId: string, page: number = 1, limit: number = 10) {

    const params = new HttpParams()
      .set('branchId', branchId)
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


  getOrders(filters?: any) {

    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.paymentStatus) {
      params = params.set('paymentStatus', filters.paymentStatus);
    }

    if (filters?.page) {
      params = params.set('page', String(filters.page));
    }

    if (filters?.limit) {
      params = params.set('limit', String(filters.limit));
    }

    params = params.set('branchId', filters?.branchId || '');

    console.log('FINAL PARAMS:', params.toString()); 

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