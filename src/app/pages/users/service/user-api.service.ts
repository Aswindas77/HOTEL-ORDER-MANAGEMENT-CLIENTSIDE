import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { User } from '../../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private baseUrl = `${environment.host}/users`;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(this.baseUrl);
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