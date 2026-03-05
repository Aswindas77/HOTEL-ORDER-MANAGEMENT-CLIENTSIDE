import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MenuApiService } from './service/menu-api.service';
import { MenuCategory } from '../../enums/menu-category.enum';
import { FoodType } from '../../enums/food-type.enum';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  menus: any[] = [];
  loading = false;

  showModal = false;
  editingMenuId: string | null = null;

  categories = Object.values(MenuCategory);
  foodTypes = Object.values(FoodType);

  menuForm = {
    name: '',
    description: '',
    price: 0,
    category: '' as any,
    foodType: '' as any,
    preparationTime: 0,
    image: '',
    isAvailable: true,
  };

  // 🔍 Filters
  filters = {
    search: '',
    category: '',
    foodType: ''
  };

  // 📄 Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  paginatedMenus: any[] = [];

  expandedMenuId: string | null = null;

  constructor(
    private menuApi: MenuApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMenus();
  }

  // ─────────────────────────────
  // LOAD MENUS
  // ─────────────────────────────
  loadMenus(): void {

    this.loading = true;

    const params: any = {};

    if (this.filters.search?.trim()) {
      params.search = this.filters.search.trim();
    }

    if (this.filters.category) {
      params.category = this.filters.category;
    }

    if (this.filters.foodType) {
      params.foodType = this.filters.foodType;
    }

    this.menuApi.getAdminMenus(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges(); // 🔥 force UI refresh
        })
      )
      .subscribe({
        next: (res) => {

          const data = res ?? [];

          this.menus = [...data];

          this.totalPages = Math.ceil(data.length / this.pageSize);
          this.currentPage = 1;

          this.updatePaginatedMenus();

        },
        error: () => {

          this.menus = [];
          this.paginatedMenus = [];

        }
      });
  }

  // ─────────────────────────────
  // OPEN ADD MENU
  // ─────────────────────────────
  openAddMenu(): void {

    this.editingMenuId = null;
    this.resetForm();
    this.showModal = true;

  }

  // ─────────────────────────────
  // OPEN EDIT MENU
  // ─────────────────────────────
  openEditMenu(menu: any): void {

    this.editingMenuId = menu._id;

    this.menuForm = {
      name: menu.name,
      description: menu.description ?? '',
      price: menu.price,
      category: menu.category,
      foodType: menu.foodType,
      preparationTime: menu.preparationTime ?? 0,
      image: menu.image ?? '',
      isAvailable: menu.isAvailable,
    };

    this.showModal = true;

  }

  closeModal(): void {
    this.showModal = false;
  }

  // ─────────────────────────────
  // SAVE MENU
  // ─────────────────────────────
  saveMenu(): void {

    const payload = {
      name: this.menuForm.name,
      description: this.menuForm.description,
      price: Number(this.menuForm.price),
      category: this.menuForm.category,
      foodType: this.menuForm.foodType,
      preparationTime: this.menuForm.preparationTime
        ? Number(this.menuForm.preparationTime)
        : undefined,
      image: this.menuForm.image,
      isAvailable: true,
    };

    const request$ = this.editingMenuId
      ? this.menuApi.updateMenu(this.editingMenuId, payload)
      : this.menuApi.createMenu(payload);

    request$.subscribe({
      next: () => {

        this.closeModal();
        this.loadMenus();

      },
      error: (err) => {

        console.error(err);
        alert(err?.error?.message || 'Failed to save menu');

      }
    });

  }

  // ─────────────────────────────
  // ENABLE / DISABLE MENU
  // ─────────────────────────────
  toggleAvailability(menu: any): void {

  const request$ = menu.isAvailable
    ? this.menuApi.disableMenu(menu._id)
    : this.menuApi.enableMenu(menu._id);

  request$.subscribe({
    next: () => {

      this.menus = this.menus.map(m =>
        m._id === menu._id
          ? { ...m, isAvailable: !m.isAvailable }
          : m
      );

      this.updatePaginatedMenus();
      this.cdr.detectChanges();

    },
    error: () => {
      alert('Failed to update status');
    }
  });

}

  // ─────────────────────────────
  // RESET FORM
  // ─────────────────────────────
  resetForm(): void {

    this.menuForm = {
      name: '',
      description: '',
      price: 0,
      category: '' as any,
      foodType: '' as any,
      preparationTime: 0,
      image: '',
      isAvailable: true,
    };

  }

  // ─────────────────────────────
  // FILTER CLEAR
  // ─────────────────────────────
  clearFilters(): void {

    this.filters = {
      search: '',
      category: '',
      foodType: ''
    };

    this.loadMenus();

  }

  // ─────────────────────────────
  // PAGINATION
  // ─────────────────────────────
  updatePaginatedMenus(): void {

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedMenus = this.menus.slice(start, end);

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.updatePaginatedMenus();

  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // ─────────────────────────────
  // EXPAND MENU DETAILS
  // ─────────────────────────────
  toggleExpand(menuId: string) {

    this.expandedMenuId =
      this.expandedMenuId === menuId ? null : menuId;

  }

}