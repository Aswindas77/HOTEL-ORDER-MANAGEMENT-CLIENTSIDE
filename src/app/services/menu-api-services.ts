import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { MenuItem } from '../pages/tableViewSide/tableView';

@Injectable({ providedIn: 'root' })
export class MenuApiService {

    constructor(private http: HttpClient) { }

    createMenu(payload: any) {
        return this.http.post(`${environment.host}/menu`, payload);
    }

    
    getMenu(params?: any) {
        const httpParams = new HttpParams({
            fromObject: { ...(params ?? {}) }
        });

        return this.http.get<MenuItem[]>(
            `${environment.host}/api/menu`,
            { params: httpParams }
        );
    }

    
    getMenuById(id: string) {
        return this.http.get(`${environment.host}/menu/${id}`);
    }

   
    updateMenu(id: string, payload: any) {
        return this.http.patch(`${environment.host}/menu/${id}`, payload);
    }

    
    disableMenu(id: string) {
        return this.http.patch(`${environment.host}/menu/${id}/disable`, {});
    }

   
    enableMenu(id: string) {
        return this.http.patch(`${environment.host}/menu/${id}/enable`, {});
    }

    getMenuByTable(token: string, params?: any) {
        return this.http.get<any>(
            `${environment.host}/api/menu/by-table/${token}`,
            { params }
        );
    }
}