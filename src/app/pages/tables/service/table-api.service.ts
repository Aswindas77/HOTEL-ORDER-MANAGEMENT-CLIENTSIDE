import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Table } from '../../../models/table.model';

@Injectable({ providedIn: 'root' })
export class TableApiService {

  private baseUrl = `${environment.host}/api/tables`;

  constructor(private http: HttpClient) {}

  getTables() {
    return this.http.get<Table[]>(this.baseUrl);
  }

  createTable(payload: {
    tableNumber: string;
    capacity: number;
    status: string;
  }) {
    return this.http.post(this.baseUrl, payload);
  }

  updateTable(id: string, payload: any) {
    return this.http.patch(`${this.baseUrl}/${id}`, payload);
  }

  deleteTable(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  openTable(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/open`, {});
  }

  closeTable(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/close`, {});
  }
}