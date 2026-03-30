import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelApiService } from './service/hotel-api.service';
import { BranchApiService } from './service/branch-api.service';
import { Router, ActivatedRoute } from '@angular/router';

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

  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;

  search = '';

  constantTotal = 0;

  constructor(
    private hotelApi: HotelApiService,
    private branchApi: BranchApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

      this.route.queryParams.subscribe(params => {

    this.page = +params['page'] || 1;
    this.search = params['search'] || '';
    this.status = params['status'] || '';
    this.loadHotels();
    });
  }



  loadHotels() {

      this.router.navigate([], {
    queryParams: {
      page: this.page,
      search: this.search || null,
      status: this.status || null
    },
    queryParamsHandling: 'merge'
  });

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

  this.hotelApi.getHotels(
    1,
    1,
    '',
    ''
  ).subscribe((res: any) => {

    this.constantTotal = res.total; 

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