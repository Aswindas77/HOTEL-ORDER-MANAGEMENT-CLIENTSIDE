import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private baseUrl = `${environment.host}/orders`;

  constructor(private http: HttpClient) {}

  // ✅ ADMIN: GET ALL ORDERS
getOrders(params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  let httpParams = new HttpParams();

  if (params?.status) {
    httpParams = httpParams.set('status', params.status);
  }

  if (params?.paymentStatus) {
    httpParams = httpParams.set('paymentStatus', params.paymentStatus);
  }

  if (params?.search) {
    httpParams = httpParams.set('search', params.search);
  }

  if (params?.page) {
    httpParams = httpParams.set('page', params.page);
  }

  if (params?.limit) {
    httpParams = httpParams.set('limit', params.limit);
  }

  return this.http.get<any>(this.baseUrl, { params: httpParams });
}

  updateStatus(orderId: string, status: string) {
    return this.http.patch(
      `${this.baseUrl}/${orderId}/status`,
      { status }
    );
  }

  markAsPaid(orderId: string) {
    return this.http.patch(
      `${this.baseUrl}/${orderId}/pay`,
      {}
    );
  }

  markAsUnpaid(orderId: string) {
    return this.http.patch(
      `${this.baseUrl}/${orderId}/unpay`,
      {}
    );
  }
}