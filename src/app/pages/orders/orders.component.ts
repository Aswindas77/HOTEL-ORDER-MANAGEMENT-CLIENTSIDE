import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, finalize } from 'rxjs/operators';

import { Order } from '../../models/order.model';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { OrderApiService } from '../../services/order-api-services';

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
  pageSize = 5;
  totalPages = 1;

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd &&
            event.urlAfterRedirects.includes('/orders')
        )
      )
      .subscribe(() => this.loadOrders());

    this.loadOrders();
  }

  /* ================= LOAD ORDERS ================= */
  loadOrders(): void {

    this.loading = true;

    this.orderApi.getOrders({
      search: this.search || undefined,
      status: this.selectedStatus ?? undefined,
      paymentStatus: this.selectedPayment ?? undefined,
      page: this.currentPage,
      limit: this.pageSize
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); // force UI refresh
      })
    )
    .subscribe({
      next: (res) => {

        console.log("ORDERS RESPONSE:", res);

        this.orders = res?.data ?? [];
        this.totalPages = res?.totalPages ?? 1;

        this.cdr.detectChanges(); // refresh UI immediately
      },
      error: (err) => {

        console.error("Orders API error:", err);
        this.orders = [];

        this.cdr.detectChanges();
      }
    });

  }

  /* ================= ACTIONS ================= */

  toggleExpand(orderId: string) {
    this.expandedOrderId =
      this.expandedOrderId === orderId ? null : orderId;
  }

  changeStatus(order: Order, status: OrderStatus) {
    this.orderApi.updateOrderStatus(order._id, status)
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
    this.currentPage = 1;

    this.loadOrders();
  }

  getNextStatuses(order: Order): OrderStatus[] {
    return this.validStatusTransitions[order.status] ?? [];
  }

  /* ================= PAGINATION ================= */

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.loadOrders();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }
}