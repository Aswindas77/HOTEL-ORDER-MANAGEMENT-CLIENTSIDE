import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserApiService } from './service/user-api.service';
import { User } from '../../models/user.model';
import { Role } from '../../enums/role.enum';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {

  users: User[] = [];
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

  constructor(private userApi: UserApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userApi.getUsers().subscribe({
      next: res => {
        this.users = res;
        this.loading = false;
      },
      error: () => this.loading = false,
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

  /* ---------- SAVE ---------- */

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

  /* ---------- TOAST ---------- */

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3000);
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
}