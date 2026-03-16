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

  selectedSub:any = null;

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

  openDetails(sub:any){
  this.selectedSub = sub;
  this.cdr.detectChanges();
}

closeModal(){
  this.selectedSub = null;
  this.cdr.detectChanges();
}

viewHotel(hotel:any){
  console.log('View hotel', hotel);
}

sendReminder(sub:any){

  const phone = sub.branchId?.phone;

  const message = `⚠ Subscription Expiring Soon

Hotel: ${sub.hotelId?.name}
Branch: ${sub.branchId?.branchName}

Please renew your subscription before expiry.

Contact Support if needed.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');

}

getDaysLeft(expiryDate: string): number {

  const today = new Date();
  const expiry = new Date(expiryDate);

  const diff = expiry.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

getStatus(expiryDate: string) {

  const days = this.getDaysLeft(expiryDate);

  if (days <= 0) return 'expired';

  if (days <= 2) return 'critical';

  if (days <= 4) return 'expiring';

  return 'upcoming';
}


}