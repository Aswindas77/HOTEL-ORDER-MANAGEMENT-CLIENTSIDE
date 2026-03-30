import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, finalize } from 'rxjs/operators';

import { Order } from '../../models/order.model';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { OrderApiService } from '../../services/order-api-services';
import { AuthApiService } from '../../services/auth-api.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrdersComponent implements OnInit {

  readonly Math = Math;
  readonly OrderStatus = OrderStatus;
  readonly PaymentStatus = PaymentStatus;

  orders: Order[] = [];
  loading = false;

  search = '';
  selectedStatus: OrderStatus | null = null;
  selectedPayment: PaymentStatus | null = null;

  statuses = Object.values(OrderStatus);
  payments = Object.values(PaymentStatus);

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalOrders = 0;

  expandedOrderId: string | null = null;
  processingOrderId: string | null = null;

  branchId: string = '';

  stepperSteps: string[] = [
    OrderStatus.PENDING,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED,
    OrderStatus.COMPLETED,
  ];

  constructor(
    private orderApi: OrderApiService,
    private authApi: AuthApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {

   
    const token = this.authApi.getToken();

    if (token) {
      const decoded: any = jwtDecode(token);
      this.branchId = decoded.branchId || '';
    }

    console.log('BranchId:', this.branchId);

    const query = this.router.parseUrl(this.router.url).queryParams;

    if (query['page']) this.currentPage = Number(query['page']);
    if (query['search']) this.search = query['search'];
    if (query['status']) this.selectedStatus = query['status'];
    if (query['payment']) this.selectedPayment = query['payment'];

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd =>
          e instanceof NavigationEnd && e.urlAfterRedirects.includes('/orders')
        )
      )
      .subscribe(() => this.loadOrders());

    this.loadOrders();
  }

  loadOrders(): void {

    this.router.navigate([], {
      queryParams: {
        page: this.currentPage,
        search: this.search || null,
        status: this.selectedStatus || null,
        payment: this.selectedPayment || null,
      },
      queryParamsHandling: 'merge',
    });

    this.loading = true;

    this.orderApi.getOrders({
      search: this.search || undefined,
      status: this.selectedStatus ?? undefined,
      paymentStatus: this.selectedPayment ?? undefined,
      page: this.currentPage,
      limit: this.pageSize,
      branchId: this.branchId
    })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.orders = res?.data ?? [];
          this.totalPages = res?.totalPages ?? 1;
          this.totalOrders = res?.total ?? this.orders.length;
        },
        error: (err) => {
          console.error(err);
          this.orders = [];
        }
      });
  }

  toggleExpand(orderId: string): void {
    this.expandedOrderId =
      this.expandedOrderId === orderId ? null : orderId;
  }

  getStatusClass(status: string): string {
    return {
      PENDING: 'pending',
      PREPARING: 'preparing',
      READY: 'ready',
      SERVED: 'served',
      COMPLETED: 'completed'
    }[status] || '';
  }

  getPaymentClass(status: string): string {
    return {
      PAID: 'paid',
      UNPAID: 'unpaid'
    }[status] || '';
  }

  isStepDone(current: string, step: string): boolean {
    const order = [
      'PENDING',
      'PREPARING',
      'READY',
      'SERVED',
      'COMPLETED'
    ];
    return order.indexOf(step) <= order.indexOf(current);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changeStatus(order: Order, status: OrderStatus): void {

    if (this.processingOrderId) return;

    this.processingOrderId = order._id;

    this.orderApi.updateOrderStatus(order._id, status, this.branchId)
      .subscribe({
        next: () => {
          this.processingOrderId = null;
          this.loadOrders();
        },
        error: (err) => {
          console.error(err);
          this.processingOrderId = null;
          alert(err?.error?.message || 'Please mark payment before completing order');
        }
      });
  }

  markPaid(order: Order): void {

    this.processingOrderId = order._id;

    this.orderApi.markAsPaid(order._id, this.branchId)
      .subscribe({
        next: () => {
          this.processingOrderId = null;
          this.loadOrders();
        },
        error: () => {
          this.processingOrderId = null;
          alert('Payment update failed');
        }
      });
  }

  markUnpaid(order: Order): void {

    this.processingOrderId = order._id;

    this.orderApi.markAsUnpaid(order._id, this.branchId)
      .subscribe({
        next: () => {
          this.processingOrderId = null;
          this.loadOrders();
        },
        error: () => {
          this.processingOrderId = null;
          alert('Payment update failed');
        }
      });
  }


  searchOrders(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  resetFilters(): void {
    this.search = '';
    this.selectedStatus = null;
    this.selectedPayment = null;
    this.currentPage = 1;
    this.loadOrders();
  }


  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadOrders();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }
}