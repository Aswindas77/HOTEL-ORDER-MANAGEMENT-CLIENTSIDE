import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Menu } from '../../../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuApiService {

  private readonly baseUrl = `${environment.host}/api/menu`;

  constructor(private http: HttpClient) { }

  // ✅ CREATE MENU (POST /menu)
  createMenu(payload: Partial<Menu>) {
    return this.http.post<Menu>(this.baseUrl, payload);
  }

  // ✅ GET MENUS (GET /menu)
  getMenus(params?: {
    category?: string;
    foodType?: string;
    search?: string;
  }) {
    const httpParams = new HttpParams({
      fromObject: { ...(params ?? {}) } as any
    });

    return this.http.get<Menu[]>(this.baseUrl, { params: httpParams });
  }

  getAdminMenus(params?: {
    category?: string;
    foodType?: string;
    search?: string;
  }) {
    const httpParams = new HttpParams({
      fromObject: { ...(params ?? {}) } as any
    });

    return this.http.get<Menu[]>(`${this.baseUrl}/admin`, {
      params: httpParams
    });
  }

  // ✅ GET MENU BY ID (GET /menu/:id)
  getMenuById(menuId: string) {
    return this.http.get<Menu>(`${this.baseUrl}/${menuId}`);
  }

  // ✅ UPDATE MENU (PATCH /menu/:id)
  updateMenu(menuId: string, payload: Partial<Menu>) {
    return this.http.patch<Menu>(`${this.baseUrl}/${menuId}`, payload);
  }

  // ✅ DISABLE MENU (PATCH /menu/:id/disable)
  disableMenu(menuId: string, hotelId: string, branchId: string) {
    const params = new HttpParams()
      .set('hotelId', hotelId)
      .set('branchId', branchId);
    return this.http.patch(`${this.baseUrl}/${menuId}/disable`, {}, { params });
  }

  // ✅ ENABLE MENU (PATCH /menu/:id/enable)
  enableMenu(menuId: string, hotelId: string, branchId: string) {

    const params = new HttpParams()
      .set('hotelId', hotelId)
      .set('branchId', branchId);

    return this.http.patch(`${this.baseUrl}/${menuId}/enable`, {}, { params });

  }
}


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { environment } from '../../environment/environment';

// @Injectable({ providedIn: 'root' })
// export class MenuApiService {

//   constructor(private http: HttpClient) {}

//   // POST /menu
//   createMenu(payload: any) {
//     return this.http.post(
//       `${environment.host}/menu`,
//       payload
//     );
//   }

//   // GET /menu?category=&foodType=&search=
//   getMenus(params?: {
//     category?: string;
//     foodType?: string;
//     search?: string;
//   }) {
//     const httpParams = new HttpParams({
//       fromObject: { ...(params ?? {}) } as any
//     });

//     return this.http.get(
//       `${environment.host}/menu`,
//       { params: httpParams }
//     );
//   }

//   // GET /menu/:id
//   getMenuById(menuId: string) {
//     return this.http.get(
//       `${environment.host}/menu/${menuId}`
//     );
//   }

//   // PATCH /menu/:id
//   updateMenu(menuId: string, payload: any) {
//     return this.http.patch(
//       `${environment.host}/menu/${menuId}`,
//       payload
//     );
//   }

//   // PATCH /menu/:id/disable
//   disableMenu(menuId: string) {
//     return this.http.patch(
//       `${environment.host}/menu/${menuId}/disable`,
//       {}
//     );
//   }

//   // PATCH /menu/:id/enable
//   enableMenu(menuId: string) {
//     return this.http.patch(
//       `${environment.host}/menu/${menuId}/enable`,
//       {}
//     );
//   }
// }