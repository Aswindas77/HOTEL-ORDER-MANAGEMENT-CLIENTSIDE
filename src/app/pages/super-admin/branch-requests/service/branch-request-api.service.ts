import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchRequestApiService {

  private baseUrl = `${environment.host}/api/activation-request`;

  constructor(private http: HttpClient) { }

  getRequests(page?: number, limit?: number, search?: string, status?: string) {

    let params: any = {};

    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (search) params.search = search;
    if (status) params.status = status;

    return this.http.get(this.baseUrl, { params });
  }

  approveRequest(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectRequest(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/reject`, {});
  }

}