import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Table } from '../../../models/table.model';
import { TableStatus } from '../../../enums/table-status.enum';
import { AuthApiService } from '../../../services/auth-api.service';


@Injectable({ providedIn: 'root' })
export class TableApiService {

  private baseUrl = `${environment.host}/api/tables`;

  constructor(
    private http: HttpClient,
    private authService: AuthApiService
  ) {}

  getTables(
    page: number = 1,
    limit: number = 12,
    search?: string,
    status?: TableStatus
  ) {

    const branchId = this.authService.getBranchId();
    

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('branchId', branchId || '');

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

    const branchId = this.authService.getBranchId();

    return this.http.post(this.baseUrl, {
      ...payload,
      branchId
    });
  }


  updateTable(id: string, payload: any) {

    const branchId = this.authService.getBranchId();

    return this.http.patch(
      `${this.baseUrl}/${id}?branchId=${branchId}`,
      payload
    );
  }


  deleteTable(id: string) {

    const branchId = this.authService.getBranchId();

    return this.http.delete(
      `${this.baseUrl}/${id}?branchId=${branchId}`
    );
  }

 
  openTable(id: string) {

    const branchId = this.authService.getBranchId();

    return this.http.patch(
      `${this.baseUrl}/${id}/open?branchId=${branchId}`,
      {}
    );
  }


  closeTable(id: string) {

    const branchId = this.authService.getBranchId();

    return this.http.patch(
      `${this.baseUrl}/${id}/close?branchId=${branchId}`,
      {}
    );
  }

}