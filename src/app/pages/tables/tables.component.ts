import {
  Component,
  OnInit,
  ChangeDetectorRef,
  HostListener,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, finalize } from 'rxjs/operators';

import { TableApiService } from './service/table-api.service';
import { Table } from '../../models/table.model';
import { TableStatus } from '../../enums/table-status.enum';

@Component({
  standalone: true,
  selector: 'app-tables',
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TablesComponent implements OnInit {

  // ── Enum ─────────────────────────────────────────
  readonly TableStatus = TableStatus;

  // ── Data ─────────────────────────────────────────
  tables: Table[] = [];
  loading = false;

  // ── Filters ──────────────────────────────────────
  search = '';
  selectedStatus: TableStatus | null = null;
  statuses = Object.values(TableStatus);

  // ── Pagination ───────────────────────────────────
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedTables(): Table[] {
    return this.tables;
  }

  // ── Stats ────────────────────────────────────────
  get availableCount(): number {
    return this.tables.filter(t => t.status === TableStatus.AVAILABLE).length;
  }

  get occupiedCount(): number {
    return this.tables.filter(t => t.status === TableStatus.OCCUPIED).length;
  }

  get occupancyRate(): number {
    if (!this.tables.length) return 0;
    return Math.round((this.occupiedCount / this.tables.length) * 100);
  }

  // ── Modal ────────────────────────────────────────
  modalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedTable: Table | null = null;

  form = {
    tableNumber: '',
    capacity: null as number | null,
  };

  // ── Toast ────────────────────────────────────────
  toast: { message: string; type: 'success' | 'error' } | null = null;
  private toastTimer: any;

  constructor(
    private tableApi: TableApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  // ── INIT ─────────────────────────────────────────
  ngOnInit(): void {

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd =>
          e instanceof NavigationEnd && e.urlAfterRedirects.includes('/tables')
        )
      )
      .subscribe(() => {
        const q = this.router.parseUrl(this.router.url).queryParams;

        this.currentPage = q['page'] ? Number(q['page']) : 1;
        this.search = q['search'] || '';
        this.selectedStatus = q['status'] || null;

        this.loadTables();
      });

    this.loadTables();
  }

  // ── LOAD TABLES ──────────────────────────────────
  loadTables(): void {
    this.loading = true;

    this.tableApi.getTables(
      this.currentPage,
      this.pageSize,
      this.search,
      this.selectedStatus || undefined
    )
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (res) => {
        this.tables = res.data;
        this.totalPages = res.totalPages;
      },
      error: () => {
        this.tables = [];
      },
    });
  }

  // ── FILTERS ──────────────────────────────────────
  applyFilters(): void {
    this.currentPage = 1;
    this.updateUrl();
    this.loadTables();
  }

  resetFilters(): void {
    this.search = '';
    this.selectedStatus = null;
    this.currentPage = 1;
    this.updateUrl();
    this.loadTables();
  }

  // ── PAGINATION ───────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateUrl();
    this.loadTables();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateUrl();
      this.loadTables();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateUrl();
      this.loadTables();
    }
  }

  updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.currentPage,
        search: this.search || null,
        status: this.selectedStatus || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  // ── TABLE ACTIONS ────────────────────────────────
  openTable(table: Table): void {
    this.tableApi.openTable(table._id).subscribe({
      next: () => {
        this.showToast(`Table ${table.tableNumber} opened`);
        this.loadTables();
      },
      error: () => this.showToast('Failed to open table', 'error'),
    });
  }

  closeTable(table: Table): void {
    this.tableApi.closeTable(table._id).subscribe({
      next: () => {
        this.showToast(`Table ${table.tableNumber} closed`);
        this.loadTables();
      },
      error: () => this.showToast('Failed to close table', 'error'),
    });
  }

  removeTable(table: Table): void {
    if (!confirm(`Remove table ${table.tableNumber}?`)) return;

    this.tableApi.deleteTable(table._id).subscribe({
      next: () => {
        this.showToast('Table removed successfully');
        this.loadTables();
      },
      error: () => this.showToast('Failed to remove table', 'error'),
    });
  }

  // ── MODAL ────────────────────────────────────────
  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedTable = null;
    this.form = { tableNumber: '', capacity: null };
    this.modalOpen = true;
  }

  openEditModal(table: Table): void {
    this.modalMode = 'edit';
    this.selectedTable = table;
    this.form = {
      tableNumber: table.tableNumber,
      capacity: table.capacity,
    };
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedTable = null;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('tb-modal-overlay')) {
      this.closeModal();
    }
  }

  saveTable(): void {
    if (!this.form.tableNumber || !this.form.capacity) return;

    if (this.modalMode === 'add') {
      this.tableApi.createTable({
        tableNumber: this.form.tableNumber.trim(),
        capacity: this.form.capacity!,
        status: TableStatus.AVAILABLE,
      }).subscribe({
        next: () => {
          this.showToast('Table created successfully');
          this.closeModal();
          this.loadTables();
        },
        error: () => this.showToast('Failed to create table', 'error'),
      });
    }

    if (this.modalMode === 'edit' && this.selectedTable) {
      this.tableApi.updateTable(this.selectedTable._id, {
        tableNumber: this.form.tableNumber.trim(),
        capacity: this.form.capacity!,
      }).subscribe({
        next: () => {
          this.showToast('Table updated successfully');
          this.closeModal();
          this.loadTables();
        },
        error: () => this.showToast('Failed to update table', 'error'),
      });
    }
  }

  // ── CSS HELPERS ──────────────────────────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      AVAILABLE: 'tb-available',
      OCCUPIED: 'tb-occupied',
      RESERVED: 'tb-reserved',
    };
    return map[status] ?? '';
  }

  // ── TOAST ────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  // ── ESC KEY ──────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen) this.closeModal();
  }

}