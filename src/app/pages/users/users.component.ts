import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserApiService } from './service/user-api.service';
import { User } from '../../models/user.model'; 
import { Role } from '../../enums/role.enum';

import { finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  search = '';
selectedRole: Role | null = null;
selectedStatus: boolean | null = null;

currentPage = 1;
pageSize = 10;
totalPages = 1;

filteredUsers: User[] = [];
  loading = false;

  modalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedUser: User | null = null;

  Role = Role;

  form = {
    name: '',
    email: '',
    password: '',
    role: Role.ADMIN,
  };

  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private userApi: UserApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

      this.route.queryParams.subscribe(params => {

    this.currentPage = params['page'] ? +params['page'] : 1;
    this.search = params['search'] || '';
    this.selectedRole = params['role'] || null;
    this.selectedStatus =
      params['status'] !== undefined ? params['status'] === 'true' : null;
    
      this.loadUsers();
      });
  }



  loadUsers() {

    this.loading = true;

    this.userApi.getUsers(
       this.currentPage,
    this.pageSize,
    this.search,
    this.selectedRole || undefined,
    this.selectedStatus === null ? undefined : this.selectedStatus
    )
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: res => {
      this.users = res.data;
      this.filteredUsers = res.data;

      this.totalPages = res.totalPages;
        },
        error: () => {
          this.users = [];
          this.filteredUsers = [];
        },
      });
  }
 
  applyFilters() {

  this.currentPage = 1;

  this.updateUrl();

}

resetFilters() {

  this.search = '';
  this.selectedRole = null;
  this.selectedStatus = null;
  this.currentPage = 1;

  this.updateUrl();

}


goToPage(page: number) {

  if (page < 1 || page > this.totalPages) return;

  this.currentPage = page;

  this.updateUrl();

}

nextPage() {

  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updateUrl();
  }

}

prevPage() {

  if (this.currentPage > 1) {
    this.currentPage--;
    this.updateUrl();
  }

}

updateUrl() {

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: {
      page: this.currentPage,
      search: this.search || null,
      role: this.selectedRole || null,
      status:
        this.selectedStatus === null
          ? null
          : this.selectedStatus
    },
    queryParamsHandling: 'merge'
  });

}
  /* ---------- MODAL ---------- */

  openAddModal() {
    this.modalMode = 'add';
    this.modalOpen = true;
    this.resetForm();
  }

  openEditModal(user: User) {

    this.modalMode = 'edit';
    this.selectedUser = user;
    this.modalOpen = true;

    this.form = {
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    };
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedUser = null;
  }

  resetForm() {
    this.form = {
      name: '',
      email: '',
      password: '',
      role: Role.ADMIN,
    };
  }



  saveUser() {

    if (!this.form.name || !this.form.email) return;

    if (this.modalMode === 'add') {

      this.userApi.createUser(this.form).subscribe({
        next: () => {
          this.showToast('User created successfully');
          this.closeModal();
          this.loadUsers();
        },
        error: () => this.showToast('Failed to create user', 'error'),
      });

    } else {

      this.userApi.updateUser(this.selectedUser!._id, this.form).subscribe({
        next: () => {
          this.showToast('User updated successfully');
          this.closeModal();
          this.loadUsers();
        },
        error: () => this.showToast('Failed to update user', 'error'),
      });

    }
  }



  removeUser(user: User) {

    if (!confirm(`Remove ${user.name}?`)) return;

    this.userApi.deleteUser(user._id).subscribe({
      next: () => {
        this.showToast('User removed');
        this.loadUsers();
      },
      error: () => this.showToast('Failed to remove user', 'error'),
    });
  }



  deactivateUser(user: User): void {

    this.userApi.updateUser(user._id, { isActive: false }).subscribe({
      next: () => {
        this.showToast(`${user.name} deactivated`, 'success');
        this.loadUsers();
      },
      error: () => {
        this.showToast('Failed to deactivate user', 'error');
      },
    });
  }

  activateUser(user: User): void {

    this.userApi.updateUser(user._id, { isActive: true }).subscribe({
      next: () => {
        this.showToast(`${user.name} activated`, 'success');
        this.loadUsers();
      },
      error: () => {
        this.showToast('Failed to activate user', 'error');
      },
    });
  }



  showToast(message: string, type: 'success' | 'error' = 'success') {

    this.toast = { message, type };

    setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3000);

  }

}