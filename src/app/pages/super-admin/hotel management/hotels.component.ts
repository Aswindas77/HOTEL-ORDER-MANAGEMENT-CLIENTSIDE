import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelApiService } from './service/hotel-api.service';
import { BranchApiService } from './service/branch-api.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-hotels',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hotels.component.html',
    styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {

    hotels: any[] = [];
    branches: any[] = [];

    selectedHotel: any = null;
    showModal: boolean = false;

    constructor(
        private hotelApi: HotelApiService,
        private branchApi: BranchApiService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {

        // 🔥 reload when returning to this page
        this.router.events
            .pipe(
                filter((event): event is NavigationEnd => event instanceof NavigationEnd)
            )
            .subscribe((event) => {

                if (event.urlAfterRedirects.includes('/hotels')) {
                    this.loadHotels();
                }

            });

        this.loadHotels();
    }

    loadHotels() {
        this.hotelApi.getHotels().subscribe((res: any) => {
            this.hotels = res;
            this.cdr.detectChanges(); // 🔥 force UI update
        })
    }

    viewBranches(hotel: any) {

        this.selectedHotel = hotel;
        this.showModal = true;

        this.branchApi.getBranches().subscribe((res: any) => {

            console.log("Branches API:", res);
            console.log("Hotel clicked:", hotel);

            this.branches = res.filter(
                (b: any) => (b.hotelId?._id || b.hotelId) === hotel._id
            );

            this.cdr.detectChanges(); // 🔥 refresh modal UI
        });

    }

    closeModal() {
        this.showModal = false;
    }

}
