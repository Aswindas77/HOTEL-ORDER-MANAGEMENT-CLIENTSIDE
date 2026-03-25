import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe, SlicePipe, UpperCasePipe, DecimalPipe } from '@angular/common';
import { OrderApiService } from '../../services/order-api-services';
import { Order } from '../../models/order.model';

declare const THREE: any;

interface FilterOption {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-chef-orders',
  standalone: true,
  imports: [CommonModule, DatePipe, SlicePipe, UpperCasePipe, DecimalPipe],
  templateUrl: './chef-orders.component.html',
  styleUrls: ['./chef-orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChefOrdersComponent implements OnInit, AfterViewInit, OnDestroy {

  orders: Order[] = [];
  loading = false;
  activeFilter = 'PENDING';
  today = new Date();

  page = 1;
  limit = 12;
  totalPages = 1;

  search = '';
  startDate?: string;
  endDate?: string;

  branchId: string = ''; // 🔥 ADDED

  readonly statusSteps = ['PENDING', 'PREPARING', 'READY'];

  filterOptions: FilterOption[] = [
    { key: 'PENDING', label: 'Pending', icon: '◇' },
    { key: 'PREPARING', label: 'Preparing', icon: '◉' },
    { key: 'READY', label: 'Ready', icon: '✦' },
  ];

  private animationId: number | null = null;
  private renderer: any;
  private scene: any;
  private camera: any;
  private particleGeo: any;
  private particleMat: any;
  private particles: any;
  private velocities: { x: number; y: number }[] = [];
  private diamond: any;
  private diamond2: any;
  private torus: any;
  private frame = 0;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private pollInterval: any;

  constructor(
    private orderApi: OrderApiService,
    private cdr: ChangeDetectorRef
  ) {}

  // ───────── INIT ─────────

  ngOnInit(): void {
    this.branchId = localStorage.getItem('branchId') || ''; // 🔥 ADDED

    this.loadOrders();
    this.pollInterval = setInterval(() => this.loadOrders(), 15000);
  }

  ngAfterViewInit(): void {
    this.initThreeBackground();
    this.initCssParticles();
    this.initMouseTracking();
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.renderer?.dispose();
  }

  // ───────── LOAD ORDERS ─────────

  loadOrders(): void {
    this.loading = true;

    const params: any = {
      page: this.page,
      limit: this.limit,
      branchId: this.branchId // 🔥 ADDED
    };

    if (this.search) params.search = this.search;
    if (this.activeFilter !== 'ALL') params.status = this.activeFilter;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;

    this.orderApi.getChefOrders(params).subscribe({
      next: (res: any) => {
        this.orders = res.data ?? res;
        this.totalPages = res.totalPages ?? 1;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ───────── UPDATE STATUS ─────────

  updateStatus(order: Order, status: string): void {
    this.orderApi.updateOrderStatus(order._id, status, this.branchId) // 🔥 FIXED
      .subscribe({
        next: () => this.loadOrders(),
        error: (err) => console.error('Status update failed:', err)
      });
  }

  // ───────── HELPERS ─────────

  get filteredOrders(): Order[] {
    return this.orders;
  }

  get pendingCount(): number {
    return this.orders.filter(o => o.status === 'PENDING').length;
  }

  get preparingCount(): number {
    return this.orders.filter(o => o.status === 'PREPARING').length;
  }

  get readyCount(): number {
    return this.orders.filter(o => o.status === 'READY').length;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    this.page = 1;
    this.loadOrders();
  }

  onSearch(value: string): void {
    this.search = value;
    this.page = 1;
    this.loadOrders();
  }

  setStartDate(date: string): void {
    this.startDate = date;
    this.page = 1;
    this.loadOrders();
  }

  setEndDate(date: string): void {
    this.endDate = date;
    this.page = 1;
    this.loadOrders();
  }

  clearDates(): void {
    this.startDate = undefined;
    this.endDate = undefined;
    this.page = 1;
    this.loadOrders();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadOrders();
    }
  }

  getNextStatus(status: string): string | null {
    if (status === 'PENDING') return 'PREPARING';
    if (status === 'PREPARING') return 'READY';
    return null;
  }

  isStatusDone(currentStatus: string, step: string): boolean {
    const currentIdx = this.statusSteps.indexOf(currentStatus);
    const stepIdx = this.statusSteps.indexOf(step);
    return stepIdx < currentIdx;
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getCountForFilter(key: string): number {
    if (key === 'ALL') return this.orders.length;
    return this.orders.filter(o => o.status === key).length;
  }

  getStatusClass(status: string): string {
    return {
      PENDING: 'status-pending',
      PREPARING: 'status-preparing',
      READY: 'status-ready',
      SERVED: 'status-served',
      COMPLETED: 'status-completed',
    }[status] ?? '';
  }

  getActionClass(nextStatus: string): string {
    return {
      PREPARING: 'btn-preparing',
      READY: 'btn-ready',
    }[nextStatus] ?? '';
  }

  getActionIcon(nextStatus: string): string {
    return {
      PREPARING: '◉',
      READY: '✦',
    }[nextStatus] ?? '→';
  }

  getActionLabel(nextStatus: string): string {
    return {
      PREPARING: 'Start Prep',
      READY: 'Mark Ready',
    }[nextStatus] ?? nextStatus;
  }

  getStepLabel(step: string): string {
    return {
      PENDING: 'Pending',
      PREPARING: 'Prep',
      READY: 'Ready',
      SERVED: 'Served',
      COMPLETED: 'Done',
    }[step] ?? step;
  }

  // ───────── THREE.JS (unchanged) ─────────

  private initThreeBackground(): void {}
  private initCssParticles(): void {}
  private initMouseTracking(): void {}
}