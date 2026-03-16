import { ChangeDetectorRef, Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardApiService } from './service/dashboard-api.service';

declare const Chart: any;

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

 
  loading = false;

  summary = {
    totalMenus: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeTables: 0,
    totalUsers: 0,
  };

  readonly totalTables = 24;

  get completionRate(): number {
    if (!this.summary.totalOrders) return 0;
    const done = this.summary.totalOrders - this.summary.pendingOrders;
    return Math.round((done / this.summary.totalOrders) * 100);
  }

  get occupancyRate(): number {
    return Math.round((this.summary.activeTables / this.totalTables) * 100);
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  chartPeriod: 'week' | 'month' = 'week';

  tableList = [
    { number: '01', status: 'Occ.' },
    { number: '02', status: 'Free' },
    { number: '03', status: 'Occ.' },
    { number: '04', status: 'Rsv.' },
    { number: '05', status: 'Occ.' },
    { number: '06', status: 'Free' },
    { number: '07', status: 'Rsv.' },
    { number: '08', status: 'Occ.' },
  ];

  get freeCount(): number { return this.tableList.filter(t => t.status === 'Free').length; }
  get occCount(): number { return this.tableList.filter(t => t.status === 'Occ.').length; }
  get resCount(): number { return this.tableList.filter(t => t.status === 'Rsv.').length; }

  getTableClass(t: { status: string }): string {
    const map: Record<string, string> = { 'Free': 'free', 'Occ.': 'occ', 'Rsv.': 'res' };
    return `db-tc ${map[t.status] ?? 'free'}`;
  }

  recentOrders = [
    { emoji: '🍛', name: 'Dal Makhani', category: 'Vegetarian · Main', table: 'T-07', qty: 2, amount: 520, status: 'Confirmed', time: '2 min ago' },
    { emoji: '🥩', name: 'Butter Chicken', category: 'Non-Veg · Main', table: 'T-12', qty: 1, amount: 380, status: 'Pending', time: '5 min ago' },
    { emoji: '🍺', name: 'Kingfisher Premium', category: 'Beverage', table: 'T-03', qty: 3, amount: 750, status: 'Served', time: '18 min ago' },
    { emoji: '🧁', name: 'Gulab Jamun', category: 'Dessert', table: 'T-09', qty: 4, amount: 280, status: 'Pending', time: '22 min ago' },
    { emoji: '🍗', name: 'Chicken Tikka', category: 'Non-Veg · Starter', table: 'T-15', qty: 2, amount: 460, status: 'Confirmed', time: '28 min ago' },
  ];

  topItems = [
    { name: 'Dal Makhani', orders: 38, revenue: 9880 },
    { name: 'Butter Chicken', orders: 31, revenue: 7750 },
    { name: 'Kingfisher Premium', orders: 27, revenue: 6210 },
    { name: 'Paneer Tikka', orders: 22, revenue: 5060 },
    { name: 'Gulab Jamun', orders: 19, revenue: 4370 },
  ];

  // ── Activity feed (static demo — replace with API) ───────────
  activityFeed = [
    { initials: 'RK', name: 'Rajan Kumar', desc: 'Marked order #1047 as served', label: 'Served', type: 'served', time: '2m', color: 'linear-gradient(135deg,#C9A84C,#A07820)' },
    { initials: 'PM', name: 'Priya Menon', desc: 'New order placed for Table 07', label: 'New Order', type: 'order', time: '5m', color: 'linear-gradient(135deg,#3a7d44,#1d5c2a)' },
    { initials: 'AS', name: 'Arjun Sharma', desc: 'Added new item "Mango Lassi" to menu', label: 'Menu Edit', type: 'menu', time: '18m', color: 'linear-gradient(135deg,#2962A0,#1a3d6b)' },
    { initials: 'MN', name: 'Maya Nair', desc: 'Updated Table 04 to Reserved', label: 'Table Edit', type: 'table', time: '32m', color: 'linear-gradient(135deg,#534AB7,#3C3489)' },
    { initials: 'RK', name: 'Rajan Kumar', desc: 'Cancelled order #1038 (customer request)', label: 'Cancelled', type: 'cancelled', time: '45m', color: 'linear-gradient(135deg,#c0392b,#7d2a2a)' },
  ];

  // ── Menu categories (static — wire to API) ───────────────────
  menuCategories = [
    { name: 'Mains', pct: 38, count: 56, color: '#C9A84C' },
    { name: 'Starters', pct: 24, count: 36, color: '#3a7d44' },
    { name: 'Beverages', pct: 20, count: 30, color: '#2962A0' },
    { name: 'Desserts', pct: 18, count: 26, color: '#534AB7' },
  ];

  // ── Charts ───────────────────────────────────────────────────
  private ordersChart: any;
  private menuChart: any;

  constructor(
    private dashboardApi: DashboardApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

 

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCharts(), 100);
  }

  ngOnDestroy(): void {
    this.ordersChart?.destroy();
    this.menuChart?.destroy();
  }


  loadDashboard(): void {
    this.loading = true;

    this.dashboardApi.getSummary().subscribe({
      next: (res) => {
        this.summary = res;
        this.loading = false;
        this.cdr.detectChanges();
        
        setTimeout(() => this.initCharts(), 150);
      },
      error: (err) => {
        console.error('Dashboard API error', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }


  private initCharts(): void {
    if (typeof Chart === 'undefined') return;

    this.initOrdersChart();
    this.initMenuChart();
  }

  private initOrdersChart(): void {
    const canvas = document.getElementById('db-orders-chart') as HTMLCanvasElement;
    if (!canvas) return;

    this.ordersChart?.destroy();

    this.ordersChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Confirmed',
            data: [38, 52, 45, 68, 72, 95, 60],
            backgroundColor: 'rgba(201,168,76,0.75)',
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Pending',
            data: [12, 18, 14, 22, 16, 28, 18],
            backgroundColor: 'rgba(184,146,46,0.28)',
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Served',
            data: [30, 40, 38, 55, 60, 78, 50],
            backgroundColor: 'rgba(58,125,68,0.45)',
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} orders`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9A8E7E', font: { size: 11, family: 'DM Sans' } },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(201,168,76,0.10)' },
            ticks: { color: '#9A8E7E', font: { size: 11 }, stepSize: 20 },
            border: { display: false },
          },
        },
      },
    });
  }

  private initMenuChart(): void {
    const canvas = document.getElementById('db-menu-chart') as HTMLCanvasElement;
    if (!canvas) return;

    this.menuChart?.destroy();

    this.menuChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: this.menuCategories.map(c => c.name),
        datasets: [{
          data: this.menuCategories.map(c => c.pct),
          backgroundColor: this.menuCategories.map(c => c.color),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });
  }



  setChartPeriod(period: 'week' | 'month'): void {
    this.chartPeriod = period;

  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  exportReport(): void {
    console.log('Export report');
  }

  newOrder(): void {
    this.router.navigate(['/admin/orders/new']);
  }
}