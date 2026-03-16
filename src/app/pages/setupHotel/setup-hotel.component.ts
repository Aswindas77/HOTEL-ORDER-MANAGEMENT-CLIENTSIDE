import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { HotelApiService } from '../../services/hotel-api.service';
import { BranchApiService } from '../../services/branch-api.service';
import { SubscriptionApiService } from '../../services/subscription-api.service';
import { ActivationRequestApiService } from '../../services/activation-request-api.service';

@Component({
  selector: 'app-setup-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-hotel.component.html',
  styleUrls: ['./setup-hotel.component.scss']
})
export class SetupHotelComponent {

  step = 1;
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  nextStep() {
    this.step++;
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  /* =============================
      STEP 1 : CREATE HOTEL
  ============================= */

  createHotel() {

    if (!this.hotelData.name) {
      alert('Hotel name required');
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
            alert('Hotel ID missing from response');
            return;
          }

          this.nextStep();

        },

        error: (err) => {

          console.error(err);
          alert(err?.error?.message || 'Hotel creation failed');

        }

      });

  }

  /* =============================
      STEP 2 : CREATE BRANCH
  ============================= */

  createBranch() {

    if (!this.branchData.branchName || !this.branchData.city) {
      alert('Branch name and city required');
      return;
    }

    if (!this.hotelId) {
      alert('Hotel not created yet');
      return;
    }

    const payload = {
      ...this.branchData,
      hotelId: this.hotelId
    };

    console.log('Branch Payload:', payload);

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

          console.log('Branch Created:', res);

          this.branchId = res?.data?._id || res?._id || '';

          if (!this.branchId) {
            alert('Branch ID missing');
            return;
          }

          this.nextStep();

        },

        error: (err) => {

          console.error(err);
          alert('Branch creation failed');

        }

      });

  }

  /* =============================
      STEP 3 : SELECT PLAN
  ============================= */

  selectPlan(plan: string) {

    if (!this.hotelId) {
      alert('Hotel ID missing');
      return;
    }

    this.selectedPlan = plan;

    const payload = {
      planType: plan,
      branchCount: 1,
      hotelId: this.hotelId
    };

    console.log('Subscription Payload:', payload);

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

          console.log('Subscription Created:', res);

          this.subscriptionId = res?.data?._id || res?._id || '';

          if (!this.subscriptionId) {
            alert('Subscription ID missing');
            return;
          }

          this.nextStep();

        },

        error: (err) => {

          console.error(err);
          alert('Subscription creation failed');

        }

      });

  }

  /* =============================
      STEP 4 : FINISH SETUP
  ============================= */

  finishSetup() {

    if (!this.hotelId || !this.subscriptionId || !this.branchId) {
      alert('Setup incomplete');
      return;
    }

    const payload = {
      hotelId: this.hotelId,
      subscriptionId: this.subscriptionId,
      branchId: this.branchId
    };

    console.log('Activation Payload:', payload);

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

          alert('Activation request sent to admin');

          this.router.navigate(['/waiting-approval']);

        },

        error: (err) => {

          console.error(err);
          alert('Activation request failed');

        }

      });

  }

}