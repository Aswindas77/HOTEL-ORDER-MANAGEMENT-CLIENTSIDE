import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Table } from '../../../models/table.model';
import { TableStatus } from '../../../enums/table-status.enum';

@Injectable({ providedIn: 'root' })
export class TableApiService {

  private baseUrl = `${environment.host}/api/tables`;

  constructor(private http: HttpClient) {}

  getTables(
    page: number = 1,
    limit: number = 12,
    search?: string,
    status?: TableStatus
  ) {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search) {
      params = params.set('search', search);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{
      data: Table[];
      total: number;
      page: number;
      totalPages: number;
    }>(this.baseUrl, { params });

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