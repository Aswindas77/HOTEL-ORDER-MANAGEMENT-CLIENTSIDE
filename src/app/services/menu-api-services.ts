import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { MenuItem } from '../pages/tableViewSide/tableView';

@Injectable({ providedIn: 'root' })
export class MenuApiService {

    constructor(private http: HttpClient) { }

    // Create menu
    createMenu(payload: any) {
        return this.http.post(`${environment.host}/menu`, payload);
    }

    // Get all / filtered menu
    getMenu(params?: any) {
        const httpParams = new HttpParams({
            fromObject: { ...(params ?? {}) }
        });

        return this.http.get<MenuItem[]>(
            `${environment.host}/api/menu`,
            { params: httpParams }
        );
    }

    // Get by id
    getMenuById(id: string) {
        return this.http.get(`${environment.host}/menu/${id}`);
    }

    // Update
    updateMenu(id: string, payload: any) {
        return this.http.patch(`${environment.host}/menu/${id}`, payload);
    }

    // Disable
    disableMenu(id: string) {
        return this.http.patch(`${environment.host}/menu/${id}/disable`, {});
    }

    // Enable
    enableMenu(id: string) {
        return this.http.patch(`${environment.host}/menu/${id}/enable`, {});
    }
}