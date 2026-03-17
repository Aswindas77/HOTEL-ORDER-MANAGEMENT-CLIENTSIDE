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

  // ── NEW: computed counts for the header stat chips ──
  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  get approvedCount(): number {
    return this.requests.filter(r => r.status === 'approved').length;
  }

  constructor(
    private requestApi: BranchRequestApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequests();
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

  approveRequest(id: string) {
    this.requestApi.approveRequest(id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => console.error('Approve failed', err)
    });
  }

  rejectRequest(id: string) {
    this.requestApi.rejectRequest(id).subscribe({
      next: () => this.loadRequests(),
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

  searchRequests() {
    this.page = 1;
    this.loadRequests();
  }

  clearFilters() {
    this.search = '';
    this.status = '';
    this.page = 1;
    this.loadRequests();
  }
}