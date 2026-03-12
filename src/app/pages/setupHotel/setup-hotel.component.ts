import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HotelApiService } from '../../services/hotel-api.service';

@Component({
  selector: 'app-setup-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-hotel.component.html',
  styleUrls: ['./setup-hotel.component.scss']
})
export class SetupHotelComponent {

  loading = false;

  hotelData = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(
    private hotelApi: HotelApiService,
    private router: Router
  ) {}

  createHotel() {

    this.loading = true;

    this.hotelApi.createHotel(this.hotelData).subscribe({

      next: () => {

        alert("Hotel created successfully");

        this.router.navigate(['/setup-branches']);

        this.loading = false;
      },

      error: (err) => {

        alert(err.error.message);

        this.loading = false;
      }

    });

  }

}