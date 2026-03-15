import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsApiService } from './service/analytics-api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  data: any;

  constructor(private analyticsApi: AnalyticsApiService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.analyticsApi.getAnalytics().subscribe({
      next: (res:any) => {
        this.data = res;
      },
      error: (err) => {
        console.error('Analytics error', err);
      }
    });
  }

}