import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { User } from '../../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private baseUrl = `${environment.host}/api/users`;

  constructor(private http: HttpClient) {}

getUsers(
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: string,
  status?: boolean
) {

  let params: any = {
    page,
    limit
  };

  if (search) params.search = search;
  if (role) params.role = role;
  if (status !== null && status !== undefined) params.status = status;

  return this.http.get<any>(this.baseUrl, { params });

}

  createUser(payload: any) {
    return this.http.post(this.baseUrl, payload);
  }

  updateUser(id: string, payload: any) {
    return this.http.patch(`${this.baseUrl}/${id}`, payload);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}