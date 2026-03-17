import { ChangeDetectorRef, Component, OnInit, OnDestroy, AfterViewInit, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardApiService } from './service/dashboard-api.service';
import { FormsModule } from '@angular/forms';

declare const Chart: any;

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
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

  chartPeriod: 'week' | 'month' ='week';

  startDate: string = '';
  endDate: string = '';

  orderAnalytics: any;
  recentOrders:any[] = [];

tableStatus = {
  available: 0,
  occupied: 0
};

tableList:any[] = [];

topItems: any[] = [];


  getTableClass(t: { status: string }): string {
    const map: Record<string, string> = { 'Free': 'free', 'Occ.': 'occ' };
    return `db-tc ${map[t.status] ?? 'free'}`;
  }

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
    this.loadOrderAnalytics();
    this.loadTableStatus();
    this.loadRecentOrders();
    this.loadTopItems();
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

        this.loadOrderAnalytics();

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

  loadOrderAnalytics(): void {

    this.dashboardApi
      .getOrderAnalytics(this.chartPeriod, this.startDate, this.endDate)
      .subscribe((res: any) => {

        this.orderAnalytics = res;

        setTimeout(() => {
          this.initOrdersChart();
        }, 100);

      });

  }

loadTableStatus() {

  this.dashboardApi.getTableStatus()
    .subscribe((res:any) => {

      this.tableStatus.available = res.available;
      this.tableStatus.occupied = res.occupied;

      this.tableList = res.tables;

    });

}


loadRecentOrders() {

  this.dashboardApi.getRecentOrders()
    .subscribe((res:any) => {

      this.recentOrders = res;

    });

}

getTimeAgo(date: string): string {

  const now = new Date().getTime();
  const orderTime = new Date(date).getTime();

  const diff = now - orderTime;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';

  if (minutes < 60) return minutes + ' min ago';

  if (hours < 24) return hours + ' hour ago';

  return days + ' day ago';

}

loadTopItems() {

  this.dashboardApi.getTopItems()
    .subscribe((res:any) => {

      this.topItems = res;

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
        labels: this.orderAnalytics?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Confirmed',
            data: this.orderAnalytics?.confirmed || [],
            backgroundColor: 'rgba(201,168,76,0.75)',
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Pending',
            data: this.orderAnalytics?.pending || [],
            backgroundColor: 'rgba(184,146,46,0.28)',
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: 'Served',
            data: this.orderAnalytics?.served || [],
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

    this.startDate = '';
    this.endDate = '';

    this.loadOrderAnalytics();

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

applyCustomFilter(): void {

  if (!this.startDate || !this.endDate) {
    alert('Please select start and end date');
    return;
  }

  this.dashboardApi
    .getOrderAnalytics(undefined, this.startDate, this.endDate)
    .subscribe((res: any) => {

      this.orderAnalytics = res;

      this.initOrdersChart();

    });

}
}