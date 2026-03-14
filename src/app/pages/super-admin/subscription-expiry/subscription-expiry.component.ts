import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionExpiryApiService } from './service/subscription-expiry-api.service';

@Component({
  selector: 'app-subscription-expiry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-expiry.component.html',
  styleUrls: ['./subscription-expiry.component.scss']
})
export class SubscriptionExpiryComponent implements OnInit {

  subscriptions: any[] = [];
  loading = false;

  constructor(private expiryApi: SubscriptionExpiryApiService) {}

  ngOnInit(): void {
    this.loadExpiringSubscriptions();
  }

  loadExpiringSubscriptions() {

    this.loading = true;

    this.expiryApi.getExpiringSubscriptions().subscribe({
      next: (res: any) => {
        this.subscriptions = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading subscriptions', err);
        this.loading = false;
      }
    });

  }

}