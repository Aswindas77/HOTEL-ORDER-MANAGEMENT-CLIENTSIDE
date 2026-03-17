import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  selectedSub: any = null;

  // ── NEW: stat chip counts for the header ──
  get expiredCount():  number { return this.subscriptions.filter(s => this.getStatus(s.expiryDate) === 'expired').length;  }
  get criticalCount(): number { return this.subscriptions.filter(s => this.getStatus(s.expiryDate) === 'critical').length; }
  get expiringCount(): number { return this.subscriptions.filter(s => this.getStatus(s.expiryDate) === 'expiring').length; }
  get upcomingCount(): number { return this.subscriptions.filter(s => this.getStatus(s.expiryDate) === 'upcoming').length; }

  constructor(
    private expiryApi: SubscriptionExpiryApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExpiringSubscriptions();
  }

  loadExpiringSubscriptions() {
    this.loading = true;

    this.expiryApi.getExpiringSubscriptions().subscribe({
      next: (res: any) => {
        this.subscriptions = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading subscriptions', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDetails(sub: any) {
    this.selectedSub = sub;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.selectedSub = null;
    this.cdr.detectChanges();
  }

  viewHotel(hotel: any) {
    console.log('View hotel', hotel);
  }

  sendReminder(sub: any) {
    const phone = sub.branchId?.phone;
    const message = `⚠ Subscription Expiring Soon\n\nHotel: ${sub.hotelId?.name}\nBranch: ${sub.branchId?.branchName}\n\nPlease renew your subscription before expiry.\n\nContact Support if needed.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  getDaysLeft(expiryDate: string): number {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getStatus(expiryDate: string): string {
    const days = this.getDaysLeft(expiryDate);
    if (days <= 0) return 'expired';
    if (days <= 2) return 'critical';
    if (days <= 4) return 'expiring';
    return 'upcoming';
  }
}