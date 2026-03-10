import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class SuperAdminApiService {

  constructor(private http: HttpClient) {}

  // USERS
  getUsers(page = 1, limit = 10, search = '') {
    return this.http.get(`${environment.host}/api/users?page=${page}&limit=${limit}&search=${search}`);
  }

  createUser(data:any){
    return this.http.post(`${environment.host}/api/users`,data)
  }

  updateUser(id:string,data:any){
    return this.http.patch(`${environment.host}/api/users/${id}`,data)
  }

  deleteUser(id:string){
    return this.http.delete(`${environment.host}/api/users/${id}`)
  }

  // HOTELS
  getHotels(){
    return this.http.get(`${environment.host}/api/hotels`)
  }

  createHotel(data:any){
    return this.http.post(`${environment.host}/api/hotels`,data)
  }

}