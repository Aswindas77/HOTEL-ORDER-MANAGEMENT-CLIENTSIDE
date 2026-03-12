import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class HotelApiService {

  private baseUrl = `${environment.host}/api/hotels`;

  constructor(private http: HttpClient) {}

  getHotels() {
    return this.http.get(this.baseUrl);
  }

  getHotelById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

}