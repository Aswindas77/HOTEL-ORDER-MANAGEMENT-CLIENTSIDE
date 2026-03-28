import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchRequestApiService } from './service/branch-request-api.service';
import { AnalyticsApiService } from '../analytics/service/analytics-api.service';
import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-branch-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-requests.component.html',
  styleUrls: ['./branch-requests.component.scss']
})
export class BranchRequestsComponent implements OnInit {

  requests: any[] = [];
  loading = false;

  selectedRequest: any = null;
  showDetailsModal = false;

  // pagination
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;

  // filters
  search = '';
  status = '';

  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;
  totalCount = 0;

  constructor(
    private requestApi: BranchRequestApiService,
    private analyticsApi: AnalyticsApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
     this.loadCounts();
     
    this.route.queryParams.subscribe(params => {
      this.page = +params['page'] || 1;
      this.limit = +params['limit'] || 10;
      this.search = params['search'] || '';
      this.status = params['status'] || '';

      this.loadRequests();
      
    });
  }

  loadRequests() {
    this.loading = true;

    this.requestApi.getRequests(
      this.page,
      this.limit,
      this.search,
      this.status
    )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.requests = res.data;
          this.total = res.total;
          this.totalPages = res.totalPages;
        },
        error: (err) => {
          console.error('Error loading requests', err);
        }
      });
  }

  loadCounts() {

    this.analyticsApi.getAnalytics().subscribe((res: any) => {

      const r = res.activationRequests;

      this.pendingCount = r.pending || 0;

      this.approvedCount = r.approved || 0;

      this.totalCount =
        (r.pending || 0) +
        (r.approved || 0) +
        (r.rejected || 0);

    });

  }

  approveRequest(id: string) {
    this.requestApi.approveRequest(id).subscribe({
      next: () => {
        this.loadRequests();
        this.loadCounts();
      },

      error: (err) => console.error('Approve failed', err)
    });
  }

  rejectRequest(id: string) {
    this.requestApi.rejectRequest(id).subscribe({
      next: () => {
        this.loadRequests();
        this.loadCounts();
      },
      error: (err) => console.error('Reject failed', err)
    });
  }

  openDetails(req: any) {
    this.selectedRequest = req;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedRequest = null;  // ← also clear selection on close
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updateUrl();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.updateUrl();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.updateUrl();
  }

  searchRequests() {
    this.page = 1;
    this.updateUrl();
  }

  clearFilters() {
    this.search = '';
    this.status = '';
    this.page = 1;
    this.updateUrl();
  }

  updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page,
        limit: this.limit,
        search: this.search || null,
        status: this.status || null
      },
      queryParamsHandling: 'merge'
    });
  }
}