import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchRequestApiService } from './service/branch-request-api.service';
import { finalize } from 'rxjs/operators';

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

  constructor(
    private requestApi: BranchRequestApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  /* ================= LOAD REQUESTS ================= */

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

  /* ================= APPROVE ================= */

  approveRequest(id: string) {
    this.requestApi.approveRequest(id).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (err) => {
        console.error('Approve failed', err);
      }
    });
  }

  /* ================= REJECT ================= */

  rejectRequest(id: string) {
    this.requestApi.rejectRequest(id).subscribe({
      next: () => {
        this.loadRequests();
      },
      error: (err) => {
        console.error('Reject failed', err);
      }
    });
  }

  /* ================= DETAILS MODAL ================= */

  openDetails(req: any) {
    this.selectedRequest = req;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  /* ================= PAGINATION ================= */

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadRequests();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadRequests();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadRequests();
  }

  /* ================= SEARCH ================= */

  searchRequests() {
    this.page = 1;
    this.loadRequests();
  }

  /* ================= CLEAR FILTER ================= */

  clearFilters() {
    this.search = '';
    this.status = '';
    this.page = 1;
    this.loadRequests();
  }

}