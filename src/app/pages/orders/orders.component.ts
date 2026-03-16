import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule }          from '@angular/common';
import { FormsModule }           from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, finalize }      from 'rxjs/operators';

import { Order }          from '../../models/order.model';
import { OrderStatus }    from '../../enums/order-status.enum';
import { PaymentStatus }  from '../../enums/payment-status.enum';
import { OrderApiService } from '../../services/order-api-services';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls:   ['./orders.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrdersComponent implements OnInit {

  // ── Expose to template ────────────────────────────────────────
  readonly Math          = Math;
  readonly OrderStatus   = OrderStatus;
  readonly PaymentStatus = PaymentStatus;

  // ── Data ─────────────────────────────────────────────────────
  orders:  Order[] = [];
  loading  = false;

  // ── Filters ───────────────────────────────────────────────────
  search          = '';
  selectedStatus:  OrderStatus   | null = null;
  selectedPayment: PaymentStatus | null = null;

  statuses = Object.values(OrderStatus);
  payments = Object.values(PaymentStatus);

  // ── Pagination ────────────────────────────────────────────────
  currentPage  = 1;
  pageSize     = 5;
  totalPages   = 1;
  totalOrders  = 0;          // total count from API for header label

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ── UI ────────────────────────────────────────────────────────
  expandedOrderId: string | null = null;

  // Stepper step labels in flow order
  readonly stepperSteps: string[] = [
    OrderStatus.PENDING,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED,
    OrderStatus.COMPLETED,
  ];

  // ── Stat card computed values ─────────────────────────────────
  get totalOrderCount(): number { return this.orders.length; }
  get pendingCount():    number { return this.orders.filter(o => o.status === OrderStatus.PENDING).length; }
  get preparingCount():  number { return this.orders.filter(o => o.status === OrderStatus.PREPARING).length; }
  get servedCount():     number { return this.orders.filter(o => o.status === OrderStatus.SERVED).length; }
  get unpaidCount():     number { return this.orders.filter(o => o.paymentStatus === 'UNPAID').length; }

  // ── Valid status transitions ───────────────────────────────────
  validStatusTransitions: Record<string, OrderStatus[]> = {
    PENDING:   [OrderStatus.PREPARING],
    PREPARING: [OrderStatus.READY, OrderStatus.PENDING],
    READY:     [OrderStatus.SERVED, OrderStatus.PREPARING],
    SERVED:    [OrderStatus.COMPLETED, OrderStatus.READY],
    COMPLETED: [],
  };

  constructor(
    private orderApi: OrderApiService,
    private router:   Router,
    private cdr:      ChangeDetectorRef,
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────

  ngOnInit(): void {
    const query = this.router.parseUrl(this.router.url).queryParams;

    if (query['page'])    this.currentPage     = Number(query['page']);
    if (query['search'])  this.search          = query['search'];
    if (query['status'])  this.selectedStatus  = query['status'];
    if (query['payment']) this.selectedPayment = query['payment'];

    // Reload whenever navigating back to /orders
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd =>
          e instanceof NavigationEnd && e.urlAfterRedirects.includes('/orders')
        )
      )
      .subscribe(() => this.loadOrders());

    this.loadOrders();
  }

  // ── Load orders ───────────────────────────────────────────────

  loadOrders(): void {
    this.router.navigate([], {
      queryParams: {
        page:    this.currentPage,
        search:  this.search          || null,
        status:  this.selectedStatus  || null,
        payment: this.selectedPayment || null,
      },
      queryParamsHandling: 'merge',
    });

    this.loading = true;

    this.orderApi.getOrders({
      search:        this.search          || undefined,
      status:        this.selectedStatus  ?? undefined,
      paymentStatus: this.selectedPayment ?? undefined,
      page:          this.currentPage,
      limit:         this.pageSize,
    })
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res) => {
        this.orders      = res?.data       ?? [];
        this.totalPages  = res?.totalPages ?? 1;
        this.totalOrders = res?.total      ?? this.orders.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Orders API error:', err);
        this.orders = [];
        this.cdr.detectChanges();
      },
    });
  }

  // ── Row expand / collapse ─────────────────────────────────────

  toggleExpand(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  // ── Status / payment actions ──────────────────────────────────

  changeStatus(order: Order, status: OrderStatus): void {
    this.orderApi.updateOrderStatus(order._id, status)
      .subscribe(() => this.loadOrders());
  }

  markPaid(order: Order): void {
    this.orderApi.markAsPaid(order._id)
      .subscribe(() => this.loadOrders());
  }

  markUnpaid(order: Order): void {
    this.orderApi.markAsUnpaid(order._id)
      .subscribe(() => this.loadOrders());
  }

  getNextStatuses(order: Order): OrderStatus[] {
    return this.validStatusTransitions[order.status] ?? [];
  }

  // ── Stepper helpers ───────────────────────────────────────────

  /** True when `step` comes before `currentStatus` in the flow */
  isStepDone(currentStatus: string, step: string): boolean {
    const curr = this.stepperSteps.indexOf(currentStatus as OrderStatus);
    const idx  = this.stepperSteps.indexOf(step as OrderStatus);
    return idx < curr;
  }

  // ── Badge CSS class helpers ───────────────────────────────────

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:   'or-pending',
      PREPARING: 'or-preparing',
      READY:     'or-ready',
      SERVED:    'or-served',
      COMPLETED: 'or-completed',
    };
    return map[status] ?? '';
  }

  getPaymentClass(paymentStatus: string): string {
    return paymentStatus === 'PAID' ? 'or-paid' : 'or-unpaid';
  }

  // ── Filters ───────────────────────────────────────────────────

  searchOrders(): void {
    this.currentPage = 1;
    this.router.navigate([], {
      queryParams: {
        page:    1,
        search:  this.search          || null,
        status:  this.selectedStatus  || null,
        payment: this.selectedPayment || null,
      },
      queryParamsHandling: 'merge',
    });
    this.loadOrders();
  }

  resetFilters(): void {
    this.search          = '';
    this.selectedStatus  = null;
    this.selectedPayment = null;
    this.currentPage     = 1;
    this.loadOrders();
  }

  // ── Pagination ────────────────────────────────────────────────

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