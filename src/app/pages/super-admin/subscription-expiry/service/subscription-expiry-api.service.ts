import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionExpiryApiService {

  private baseUrl = `${environment.host}/api/subscriptions`;

  constructor(private http: HttpClient) {}

  getExpiringSubscriptions() {
    return this.http.get(`${this.baseUrl}/expiring`);
  }

}