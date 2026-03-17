// src/app/pages/super-admin/user-management/user-management.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperAdminApiService } from '../../../services/super-admin-api/super-admin-api.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'],
})
export class UserManagementComponent implements OnInit {

  users: any[]         = [];
  filteredUsers: any[] = [];

  showForm      = false;
  editingUserId: string | null = null;

  search       = '';
  statusFilter = '';

  newUser = { name: '', email: '', password: '', role: 'MANAGER' };

  // ── Computed counts for the header pills ────────────────────
  get activeCount():   number { return this.users.filter(u => u.isActive).length; }
  get inactiveCount(): number { return this.users.filter(u => !u.isActive).length; }

  constructor(
    private api: SuperAdminApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  // ── Fetch ────────────────────────────────────────────────────
  fetchUsers(): void {
    this.api.getUsers().subscribe((res: any) => {
      const all = res.data || res;
      this.users = all
        .filter((u: any) => u.role === 'MANAGER')
        .map((u: any) => ({ ...u, isActive: u.isActive === true || u.isActive === 'true' }));
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  // ── Filter ───────────────────────────────────────────────────
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchSearch =
        !this.search ||
        user.name.toLowerCase().includes(this.search.toLowerCase()) ||
        user.email.toLowerCase().includes(this.search.toLowerCase());

      const matchStatus =
        !this.statusFilter ||
        user.isActive.toString() === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  clearFilters(): void {
    this.search      = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  // ── Modal open / close ───────────────────────────────────────
  openForm(): void {
    this.editingUserId = null;
    this.newUser = { name: '', email: '', password: '', role: 'MANAGER' };
    this.showForm = true;
  }

  /** Close modal when clicking the backdrop (not the card itself) */
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('um-modal-overlay')) {
      this.showForm = false;
    }
  }

  // ── Submit (create or update) ────────────────────────────────
  submitUser(): void {
    if (this.editingUserId) {
      this.api.updateUser(this.editingUserId, this.newUser).subscribe(() => {
        this.showForm      = false;
        this.editingUserId = null;
        this.fetchUsers();
      });
    } else {
      this.api.createUser(this.newUser).subscribe(() => {
        this.showForm = false;
        this.fetchUsers();
      });
    }
  }

  // ── Edit ─────────────────────────────────────────────────────
  editUser(user: any): void {
    this.editingUserId = user._id;
    this.newUser = { name: user.name, email: user.email, password: '', role: user.role };
    this.showForm = true;
  }

  // ── Activate / Deactivate ────────────────────────────────────
  activateUser(id: string): void {
    this.api.updateUser(id, { isActive: true }).subscribe({
      next: () => this.fetchUsers(),
      error: err => console.error('Activate error', err),
    });
  }

  deactivateUser(id: string): void {
    this.api.updateUser(id, { isActive: false }).subscribe({
      next: () => this.fetchUsers(),
      error: err => console.error('Deactivate error', err),
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  /** Returns 1-2 initials from a full name */
  getInitials(name: string): string {
    if (!name) return '?';
    return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}