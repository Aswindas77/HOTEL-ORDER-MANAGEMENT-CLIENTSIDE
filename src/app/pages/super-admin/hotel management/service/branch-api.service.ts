import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchApiService {

  private baseUrl = `${environment.host}/api/branch`;

  constructor(private http: HttpClient) {}

  getBranches() {
    return this.http.get(this.baseUrl);
  }

  getBranchById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

}