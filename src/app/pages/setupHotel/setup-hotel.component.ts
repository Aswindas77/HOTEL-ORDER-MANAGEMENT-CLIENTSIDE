import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { HotelApiService } from '../../services/hotel-api.service';
import { BranchApiService } from '../../services/branch-api.service';
import { SubscriptionApiService } from '../../services/subscription-api.service';
import { ActivationRequestApiService } from '../../services/activation-request-api.service';
import { AuthApiService } from '../../services/auth-api.service';
import { jwtDecode } from 'jwt-decode';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-setup-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-hotel.component.html',
  styleUrls: ['./setup-hotel.component.scss']
})
export class SetupHotelComponent implements OnInit {

  step = 1;
  savedStep = 1;
  loading = false;

  hotelId: string = '';
  branchId: string = '';
  subscriptionId: string = '';

  stepsMeta = [
    { label: 'Hotel', sub: 'Property info' },
    { label: 'Branch', sub: 'Location setup' },
    { label: 'Plan', sub: 'Subscription' },
    { label: 'Finish', sub: 'Activation' }
  ];

  hotelData = {
    name: '',
    email: '',
    phone: ''
  };

  branchData = {
    branchName: '',
    city: '',
    address: '',
    phone: ''
  };

  selectedPlan = '';

  constructor(
    private hotelApi: HotelApiService,
    private branchApi: BranchApiService,
    private subscriptionApi: SubscriptionApiService,
    private activationApi: ActivationRequestApiService,
    private authApi: AuthApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) { }

  ngOnInit() {

    const token = this.authApi.getToken();
    if (!token) return;

    const decoded: any = jwtDecode(token);

    this.step = decoded.setupStep || 1;
    this.savedStep = this.step;

    this.hotelId = decoded.hotelId || '';
    this.branchId = decoded.branchId || ''
    this.subscriptionId = decoded.subscriptionId || ''

  }

  prevStep() {

    if (this.step > this.savedStep) {
      this.step--;
    }

  }


  createHotel() {

    if (!this.hotelData.name) {
      this.toast.show('Hotel name required', 'error');
      return;
    }

    this.loading = true;

    this.hotelApi.createHotel(this.hotelData)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (res: any) => {

          console.log('Hotel Created:', res);

          this.hotelId = res?.data?._id || res?._id || '';

          if (!this.hotelId) {
            this.toast.show('Hotel ID missing from response', 'error');
            return;
          }

          this.authApi.updateSetupStep(2, this.hotelId).subscribe();

          this.step = 2;
          this.savedStep = 2;

        },

        error: (err) => {

          console.error(err);
          this.toast.show(err?.error?.message || 'Hotel creation failed', 'error')

        }

      });

  }


  createBranch() {

    if (!this.branchData.branchName || !this.branchData.city) {
      this.toast.show('Branch name and city required', 'error');
      return;
    }

    if (!this.hotelId) {
      this.toast.show('Hotel not created yet', 'error');
      return;
    }

    const payload = {
      ...this.branchData,
      hotelId: this.hotelId
    };

    this.loading = true;

    this.branchApi.createBranches(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (res: any) => {

          this.branchId = res?.data?._id || res?._id || '';

          if (!this.branchId) {
            this.toast.show('Branch ID missing', 'error');
            return;
          }

          this.authApi.updateSetupStep(3).subscribe();

          this.step = 3;
          this.savedStep = 3;

        },

        error: (err) => {

          console.error(err);
          this.toast.show('Branch creation failed', 'error');

        }

      });

  }

  selectPlan(plan: string) {

    if (!this.hotelId) {
      this.toast.show('Hotel ID missing', 'error');
      return;
    }

    this.selectedPlan = plan;

    const payload = {
      planType: plan,
      branchCount: 1,
      hotelId: this.hotelId
    };

    this.loading = true;

    this.subscriptionApi.createSubscription(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (res: any) => {

          this.subscriptionId = res?.data?._id || res?._id || '';

          if (!this.subscriptionId) {
            this.toast.show('Subscription ID missing', 'error');
            return;
          }

          this.authApi.updateSetupStep(4).subscribe();

          this.step = 4;
          this.savedStep = 4;

        },

        error: (err) => {

          console.error(err);
          this.toast.show('Subscription creation failed', 'error');

        }

      });

  }

  finishSetup() {

    if (!this.hotelId || !this.subscriptionId || !this.branchId) {
      this.toast.show('Setup incomplete', 'error');
      return;
    }

    const payload = {
      hotelId: this.hotelId,
      subscriptionId: this.subscriptionId,
      branchId: this.branchId
    };

    this.loading = true;

    this.activationApi.createRequest(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: () => {

          this.authApi.updateSetupStep(5).subscribe();

          this.toast.show('Activation request sent to admin', 'success');

          this.router.navigate(['/waiting-approval']);

        },

        error: (err) => {

          console.error(err);
          this.toast.show('Activation request failed', 'error');

        }

      });

  }

  logout(): void {
  localStorage.clear();
  this.router.navigate(['/login']);
}

}