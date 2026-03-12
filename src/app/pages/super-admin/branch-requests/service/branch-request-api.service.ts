import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchRequestApiService {

  private baseUrl = `${environment.host}/api/activation-request`;

  constructor(private http: HttpClient) {}

  getRequests() {
    return this.http.get(this.baseUrl);
  }

  approveRequest(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectRequest(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/reject`, {});
  }

}