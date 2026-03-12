import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchApiService {

  private baseUrl = `${environment.host}/api/branch`;

  constructor(private http: HttpClient) {}

  // GET all branches
  getBranches() {
    return this.http.get(this.baseUrl);
  }

  // GET branch by ID
  getBranchById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

}