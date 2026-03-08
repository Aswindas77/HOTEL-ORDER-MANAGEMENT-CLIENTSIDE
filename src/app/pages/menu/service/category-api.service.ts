import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {

  private baseUrl = `${environment.host}/api/categories`;

  constructor(private http: HttpClient) {}

  getCategories() {
    return this.http.get<any[]>(this.baseUrl);
  }

  createCategory(name: string) {
    return this.http.post(this.baseUrl, { name });
  }

  updateCategory(id: string, name: string) {
    return this.http.patch(`${this.baseUrl}/${id}`, { name });
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

}