import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

  stepsMeta = [
    { label: 'Hotel',    sub: 'Property info' },
    { label: 'Branch',   sub: 'Location setup' },
    { label: 'Plan',     sub: 'Subscription' },
    { label: 'Finish',   sub: 'Activation' }
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
  subscriptionId: string = '';

  constructor(
    private hotelApi: HotelApiService,
    private branchApi: BranchApiService,
    private subscriptionApi: SubscriptionApiService,
    private activationApi: ActivationRequestApiService,
    private router: Router
  ) { }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  // =====================================
  // STEP 1 : CREATE HOTEL
  // =====================================

  createHotel() {

    if (!this.hotelData.name) {
      alert('Hotel name required');
      return;
    }

    this.loading = true;

    this.hotelApi.createHotel(this.hotelData).subscribe({

      next: (res: any) => {

        console.log('Hotel Created:', res);

        this.loading = false;

        
        this.hotelId = res?._id || res?.data?._id || '';

        
        this.nextStep();

      },

      error: (err) => {

        console.error(err);
        alert(err?.error?.message || 'Hotel creation failed');
        this.loading = false;

      }

    });

  }

  // =====================================
  // STEP 2 : CREATE BRANCHES
  // =====================================

  createBranch() {

    if (!this.branchData.branchName || !this.branchData.city) {
      alert('Branch name and city required');
      return;
    }

    const payload = {
      ...this.branchData,
      hotelId: this.hotelId
    };

    console.log('Branch Payload:', payload);

    this.branchApi.createBranches(payload).subscribe({

      next: (res) => {
        console.log('Branch created', res);
        this.nextStep();
      },

      error: (err) => {
        console.error(err);
        alert('Branch creation failed');
      }

    });

  }

  // =====================================
  // STEP 3 : SELECT PLAN
  // =====================================

  selectPlan(plan: string) {

    this.selectedPlan = plan;

    const payload = {
      planType: plan,
      branchCount: 1,
      hotelId: this.hotelId
    };

    console.log('Subscription Payload:', payload);

    this.subscriptionApi.createSubscription(payload).subscribe({

      next: (res: any) => {

        console.log('Subscription created', res);

        this.subscriptionId = res._id;

        this.nextStep();

      },

      error: (err) => {
        console.error(err);
        alert('Subscription creation failed');
      }

    });

  }

  // =====================================
  // STEP 4 : FINISH SETUP
  // =====================================

  finishSetup() {

    const payload = {
      hotelId: this.hotelId,
      subscriptionId: this.subscriptionId
    };

    console.log('Activation Payload:', payload);

    this.activationApi.createRequest(payload).subscribe({

      next: (res) => {

        console.log('Activation request created', res);

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