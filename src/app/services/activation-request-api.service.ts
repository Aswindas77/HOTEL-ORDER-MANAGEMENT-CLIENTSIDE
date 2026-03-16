import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivationRequestApiService {

  constructor(private http: HttpClient) {}

  createRequest(data:any){
    return this.http.post(`${environment.host}/api/activation-request`, data);
  }

  getRequests(){
    return this.http.get(`${environment.host}/api/activation-request`);
  }

  approveRequest(id:string){
    return this.http.patch(`${environment.host}/api/activation-request/${id}/approve`, {});
  }

  rejectRequest(id:string){
    return this.http.patch(`${environment.host}/api/activation-request/${id}/reject`, {});
  }

}