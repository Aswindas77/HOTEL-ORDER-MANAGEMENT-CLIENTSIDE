import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchApiService {

  constructor(private http: HttpClient) {}

  createBranches(data:any){
    return this.http.post(`${environment.host}/api/branch`, data);
  }

}