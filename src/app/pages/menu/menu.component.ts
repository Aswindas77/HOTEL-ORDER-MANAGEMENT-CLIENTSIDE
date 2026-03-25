import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MenuApiService } from './service/menu-api.service';
import { CategoryApiService } from './service/category-api.service';
import { FoodType } from '../../enums/food-type.enum';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MenuComponent implements OnInit {

  readonly Math = Math;

  menus: any[] = [];
  paginatedMenus: any[] = [];
  loading = false;

  showModal = false;
  editingMenuId: string | null = null;
  showCategoryModal = false;
  showFilterCategoryDropdown = false;
  showModalCategoryDropdown = false;

  categories: any[] = [];
  categoryName = '';
  categorySearch = '';
  editingCategoryId: string | null = null;

  foodTypes = Object.values(FoodType);


  menuForm = {
    name: '',
    description: '',
    price: '' as any,
    category: '' as string,
    foodType: '' as any,
    isAvailable: true,
  };

  filters = {
    search: '',
    category: '',
    foodType: '',
  };

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  expandedMenuId: string | null = null;

  get availableCount(): number {
    return this.menus.filter(m => m.isAvailable).length;
  }

  get unavailableCount(): number {
    return this.menus.filter(m => !m.isAvailable).length;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get filteredCategories(): any[] {
    if (!this.categorySearch.trim()) return this.categories;

    return this.categories.filter(c =>
      c.name.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  constructor(
    private menuApi: MenuApiService,
    private categoryApi: CategoryApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authApi: AuthApiService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadMenus();
  }

  // ─────────── LOAD MENUS ───────────
  loadMenus(): void {
    this.loading = true;

    const params: any = {};
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.category && this.filters.category.length === 24) {
      params.category = this.filters.category;
    }
    if (this.filters.foodType) params.foodType = this.filters.foodType;

    this.menuApi.getAdminMenus(params)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res: any) => {
          this.menus = res || [];
          this.totalPages = Math.ceil(this.menus.length / this.pageSize);
          this.updatePaginatedMenus();
        },
        error: () => {
          this.menus = [];
          this.paginatedMenus = [];
        }
      });
  }

  // ─────────── LOAD CATEGORIES ───────────
  loadCategories(): void {
    this.categoryApi.getCategories().subscribe({
      next: (res: any) => this.categories = res,
      error: () => this.categories = [],
    });
  }

  // ─────────── MENU CRUD ───────────
  openAddMenu(): void {
    this.editingMenuId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditMenu(menu: any): void {
    this.editingMenuId = menu._id;

    this.menuForm = {
      name: menu.name,
      description: menu.description ?? '',
      price: menu.price,
      category: menu.category?._id || menu.category, // ✅ FIX
      foodType: menu.foodType,
      isAvailable: menu.isAvailable,
    };

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMenu(): void {

    const user = this.authApi.getUser();

    const payload = {
      name: this.menuForm.name,
      description: this.menuForm.description,
      price: Number(this.menuForm.price),
      category: this.menuForm.category || undefined,
      foodType: this.menuForm.foodType,
      isAvailable: true,
      hotelId: user.hotelId,
      branchId: user.branchId,
    };

    const req$ = this.editingMenuId
      ? this.menuApi.updateMenu(this.editingMenuId, payload)
      : this.menuApi.createMenu(payload);

    req$.subscribe({
      next: () => {
        this.closeModal();
        this.loadMenus();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed');
      }
    });
  }

  toggleAvailability(menu: any): void {
    const req$ = menu.isAvailable
      ? this.menuApi.disableMenu(menu._id)
      : this.menuApi.enableMenu(menu._id);

    req$.subscribe(() => this.loadMenus());
  }

  // ─────────── FILTERS ───────────
  applyFilters(): void {
    this.currentPage = 1;
    this.loadMenus();
  }

  clearFilters(): void {
    this.filters = { search: '', category: '', foodType: '' };
    this.applyFilters();
  }

  selectCategory(id: string): void { // ✅ FIX
    this.filters.category = id;
    this.showFilterCategoryDropdown = false;
    this.applyFilters();
  }

  // ─────────── PAGINATION ───────────
  updatePaginatedMenus(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedMenus = this.menus.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedMenus();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // ─────────── EXPAND ───────────
  toggleExpand(id: string): void {
    this.expandedMenuId = this.expandedMenuId === id ? null : id;
  }

  // ─────────── OVERLAY ───────────
  onOverlayClick(event: MouseEvent, type: 'menu' | 'category'): void {
    if ((event.target as HTMLElement).classList.contains('mn-modal-overlay')) {
      if (type === 'menu') this.closeModal();
      else this.closeCategoryModal();
    }
  }

  // ─────────── CATEGORY CRUD ───────────
  openCreateCategory(): void {
    this.categoryName = '';
    this.editingCategoryId = null;
    this.showCategoryModal = true;
  }

  editCategory(category: any): void {
    this.editingCategoryId = category._id;
    this.categoryName = category.name;
    this.showCategoryModal = true;
  }

  deleteCategory(category: any): void {
    if (!confirm('Delete category?')) return;
    this.categoryApi.deleteCategory(category._id)
      .subscribe(() => this.loadCategories());
  }

  saveCategory(): void {

    console.log('Category Name:', this.categoryName);

    if (!this.categoryName.trim()) return;

    const req$ = this.editingCategoryId
      ? this.categoryApi.updateCategory(this.editingCategoryId, this.categoryName)
      : this.categoryApi.createCategory(this.categoryName);

    req$.subscribe({
      next: () => {
        this.loadCategories();
        this.menuForm.category = '';
        this.closeCategoryModal();
      },
      error: (err) => {
        console.log('FULL ERROR:', err);
        console.log('ERROR MESSAGE:', err?.error);
        alert(err?.error?.message || 'Failed');
      }
    });
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  // ─────────── RESET ───────────
  private resetForm(): void {
    this.menuForm = {
      name: '',
      description: '',
      price: '',
      category: '',
      foodType: '',
      isAvailable: true,
    };
  }
}