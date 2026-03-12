import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionApiService {

  constructor(private http: HttpClient) {}

  createSubscription(data:any){
    return this.http.post(`${environment.host}/api/subscriptions`, data);
  }

  getSubscription(){
    return this.http.get(`${environment.host}/api/subscriptions`);
  }

}