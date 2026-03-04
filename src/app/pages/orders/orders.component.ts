import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { OrderApiService } from './service/order-api.service';
import { Order } from '../../models/order.model';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {

  /* ================= DATA ================= */
  orders: Order[] = [];
  loading = false;
  OrderStatus = OrderStatus;

  /* ================= FILTERS ================= */
  search = '';
selectedStatus: OrderStatus | null = null;
selectedPayment: PaymentStatus | null = null;

statuses = Object.values(OrderStatus);
payments = Object.values(PaymentStatus);

  /* ================= PAGINATION ================= */
currentPage = 1;
pageSize = 5; // adjust for UI (5–8 looks premium)
totalPages = 1;
paginatedOrders: Order[] = [];

  /* ================= UI ================= */
  expandedOrderId: string | null = null;

  validStatusTransitions: Record<string, OrderStatus[]> = {
  PENDING: [OrderStatus.PREPARING],
  PREPARING: [OrderStatus.READY, OrderStatus.PENDING],
  READY: [OrderStatus.SERVED, OrderStatus.PREPARING],
  SERVED: [OrderStatus.COMPLETED, OrderStatus.READY],
  COMPLETED: [],
};

  constructor(
    private orderApi: OrderApiService,
    private router: Router
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    // Reload orders when navigating to this page
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd &&
            event.urlAfterRedirects.includes('/orders')
        )
      )
      .subscribe(() => this.loadOrders());

    // Initial load
    this.loadOrders();
  }

  /* ================= LOAD ORDERS ================= */
  loadOrders(): void {
    this.loading = true;

    this.orderApi.getOrders({
  search: this.search || undefined,
  status: this.selectedStatus ?? undefined,
  paymentStatus: this.selectedPayment ?? undefined,
    }).subscribe({
      next: (res) => {
        this.orders = res?.data ?? [];
          // Pagination calc
  this.totalPages = Math.ceil(this.orders.length / this.pageSize);
  this.currentPage = 1;
  this.updatePaginatedOrders();
        this.loading = false;
      },
      error: (err) => {
        console.error('ORDERS API ERROR', err);
        this.orders = [];
        this.loading = false;
      }
    });
  }

  /* ================= ACTIONS ================= */

  toggleExpand(orderId: string) {
    this.expandedOrderId =
      this.expandedOrderId === orderId ? null : orderId;
  }

  changeStatus(order: Order, status: OrderStatus) {
    this.orderApi.updateStatus(order._id, status)
      .subscribe(() => this.loadOrders());
  }

  markPaid(order: Order) {
    this.orderApi.markAsPaid(order._id)
      .subscribe(() => this.loadOrders());
  }

  markUnpaid(order: Order) {
    this.orderApi.markAsUnpaid(order._id)
      .subscribe(() => this.loadOrders());
  }

  /* ================= RESET ================= */
  resetFilters() {
    this.search = '';
     this.selectedStatus = null;
  this.selectedPayment = null;
    this.loadOrders();
  }

  getNextStatuses(order: Order): OrderStatus[] {
  return this.validStatusTransitions[order.status] ?? [];
}

updatePaginatedOrders() {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  this.paginatedOrders = this.orders.slice(start, end);
}

goToPage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.updatePaginatedOrders();
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePaginatedOrders();
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePaginatedOrders();
  }
}
}