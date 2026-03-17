import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class HotelApiService {

  private baseUrl = `${environment.host}/api/hotels`;

  constructor(private http: HttpClient) {}

  getHotels(page?: number, limit?: number, search?: string, status?: string) {

    let params = new HttpParams();

    if(page) params = params.set('page', page);
    if(limit) params = params.set('limit', limit);
    if(search) params = params.set('search', search);
    if(status) params = params.set('status', status);

    return this.http.get(this.baseUrl, { params });
  }

  getHotelById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

}