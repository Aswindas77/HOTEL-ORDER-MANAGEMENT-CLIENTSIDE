import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { TableApiService } from './service/table-api.service';
import { Table } from '../../models/table.model';
import { TableStatus } from '../../enums/table-status.enum';

@Component({
  standalone: true,
  selector: 'app-tables',
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent implements OnInit {

  tables: Table[] = [];
  loading = false;

  TableStatus = TableStatus;

  constructor(
    private tableApi: TableApiService,
    private cdr: ChangeDetectorRef
  ) {}

  /* ================= TOAST ================= */

  toast: {
    message: string;
    type: 'success' | 'error';
  } | null = null;

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };

    setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  /* ================= MODAL STATE ================= */

  modalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedTable: Table | null = null;

  form = {
    tableNumber: '',
    capacity: null as number | null,
  };

  ngOnInit(): void {
    this.loadTables();
  }

  /* ================= LOAD DATA ================= */

  loadTables(): void {

    this.loading = true;

    this.tableApi.getTables()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.tables = [...res];
        },
        error: () => {
          this.tables = [];
        },
      });
  }

  /* ================= TABLE ACTIONS ================= */

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

  /* ================= MODAL ================= */

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedTable = null;

    this.form = {
      tableNumber: '',
      capacity: null,
    };

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

  /* ================= SAVE ================= */

  saveTable(): void {

    if (!this.form.tableNumber || !this.form.capacity) return;

    // ADD
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

    // EDIT
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
}