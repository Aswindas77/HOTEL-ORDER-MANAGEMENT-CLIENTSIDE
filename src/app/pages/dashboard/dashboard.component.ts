import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardApiService } from './service/dashboard-api.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  loading = false;

  summary = {
    totalMenus: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeTables: 0,
    totalUsers: 0,
  };

  constructor(
    private dashboardApi: DashboardApiService
  ) {}


  ngOnInit(): void {
  this.loadDashboard();
}

loadDashboard() {
  this.loading = true;

  this.dashboardApi.getSummary().subscribe({
    next: (res) => {
      this.summary = res;
      this.loading = false;
    },
    error: (err) => {
      console.error('Dashboard API error', err);
      this.loading = false;
    },
  });
}
}








  // ngOnInit(): void {
  //   this.loadSummary();
  // }

  // loadSummary() {
  //   this.loading = true;

  //   this.dashboardApi.getSummary().subscribe({
  //     next: (res) => {
  //       this.summary = res;
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Dashboard API error', err);
  //       this.loading = false;
  //     },
  //   });
  // }
