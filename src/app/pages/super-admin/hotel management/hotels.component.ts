import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelApiService } from './service/hotel-api.service';
import { BranchApiService } from './service/branch-api.service';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {

  hotels: any[] = [];
  branches: any[] = [];

  selectedHotel: any = null;
  showModal: boolean = false;

  status = '';

  // pagination
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;

  // search
  search = '';

  constructor(
    private hotelApi: HotelApiService,
    private branchApi: BranchApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHotels();
  }



  loadHotels() {

    this.hotelApi.getHotels(
      this.page,
      this.limit,
      this.search,
      this.status
    ).subscribe((res: any) => {

      this.hotels = res.data;
      this.total = res.total;
      this.totalPages = res.totalPages;

      this.cdr.detectChanges();

    });

  }


  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadHotels();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadHotels();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadHotels();
  }



  searchHotels() {
    this.page = 1;
    this.loadHotels();
  }

  clearFilters() {

    this.search = '';
    this.status = '';
    this.page = 1;

    this.loadHotels();
  }



  viewBranches(hotel: any) {

    this.showModal = true;


    this.hotelApi.getHotelById(hotel._id).subscribe((hotelData: any) => {

      this.selectedHotel = hotelData;

      this.branchApi.getBranches().subscribe((branches: any) => {

        this.branches = branches.filter(
          (b: any) => (b.hotelId?._id || b.hotelId) === hotel._id
        );

        this.cdr.detectChanges();

      });

    });

  }



  closeModal() {
    this.showModal = false;
  }

}