import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class HotelApiService {

  constructor(private http: HttpClient) {}

  createHotel(data: any) {
    return this.http.post(`${environment.host}/api/hotels`, data);
  }

  getMyHotel() {
    return this.http.get(`${environment.host}/api/hotels/my-hotel`);
  }

  getHotelById(id: string) {
  return this.http.get(`${environment.host}/api/hotels/${id}`);
}

}