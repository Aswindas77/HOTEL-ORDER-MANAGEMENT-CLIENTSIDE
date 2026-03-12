import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchRequestApiService } from './service/branch-request-api.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-branch-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-requests.component.html',
  styleUrls: ['./branch-requests.component.scss']
})
export class BranchRequestsComponent implements OnInit {

  requests: any[] = [];
  loading = false;

  selectedRequest: any = null;
showDetailsModal = false;

  constructor(
    private requestApi: BranchRequestApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;

    this.requestApi.getRequests()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // 🔥 forces UI refresh
        })
      )
      .subscribe({
        next: (res: any) => {
          this.requests = res;
        },
        error: (err) => {
          console.error('Error loading requests', err);
          this.loading = false;
        }
      });
  }

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


  openDetails(req: any) {
  this.selectedRequest = req;
  this.showDetailsModal = true;
}

closeDetailsModal() {
  this.showDetailsModal = false;
}

}