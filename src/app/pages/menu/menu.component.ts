import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  categories: any[] = [];

  loading = false;

  showModal = false;
  showCategoryModal = false;
  showFilterCategoryDropdown = false;
  showModalCategoryDropdown = false;

  editingMenuId: string | null = null;
  editingCategoryId: string | null = null;

  categoryName = '';
  categorySearch = '';

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

  constructor(
    private menuApi: MenuApiService,
    private categoryApi: CategoryApiService,
    private cdr: ChangeDetectorRef,
    private authApi: AuthApiService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryApi.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res || [];
        this.loadMenus(); // ✅ after categories
      },
      error: () => {
        this.categories = [];
        this.loadMenus();
      },
    });
  }

  loadMenus(): void {
    this.loading = true;

    const params: any = {};
    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.category) params.category = this.filters.category;
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
          this.updatePagination();
        },
        error: () => {
          this.menus = [];
          this.paginatedMenus = [];
        }
      });
  }

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
      category: menu.category?._id || menu.category,
      foodType: menu.foodType,
      isAvailable: menu.isAvailable,
    };

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMenu(): void {

    if (!this.menuForm.category) {
      alert('Please select a category');
      return;
    }

    const user = this.authApi.getUser();

    const payload = {
      name: this.menuForm.name,
      description: this.menuForm.description,
      price: Number(this.menuForm.price),
      category: this.menuForm.category,
      foodType: this.menuForm.foodType,
      isAvailable: true,
      hotelId: user.hotelId,
      branchId: user.branchId,
    };

    console.log('PAYLOAD 👉', payload);

    const req$ = this.editingMenuId
      ? this.menuApi.updateMenu(this.editingMenuId, payload)
      : this.menuApi.createMenu(payload);

    req$.subscribe({
      next: () => {
        this.closeModal();
        this.loadMenus();
      },
      error: (err) => alert(err?.error?.message || 'Failed')
    });
  }

  toggleAvailability(menu: any): void {
    const user = this.authApi.getUser();

    const req$ = menu.isAvailable
      ? this.menuApi.disableMenu(menu._id, user.hotelId, user.branchId)
      : this.menuApi.enableMenu(menu._id, user.hotelId, user.branchId);

    req$.subscribe(() => this.loadMenus());
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadMenus();
  }

  clearFilters(): void {
    this.filters = { search: '', category: '', foodType: '' };
    this.applyFilters();
  }

  selectCategory(id: string): void {
    this.filters.category = id;
    this.showFilterCategoryDropdown = false;
    this.applyFilters();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedMenus = this.menus.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  toggleExpand(id: string): void {
    this.expandedMenuId = this.expandedMenuId === id ? null : id;
  }

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
      error: (err) => alert(err?.error?.message || 'Failed')
    });
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  getCategoryName(id: string): string {
    if (!id || !this.categories?.length) return '';
    const cat = this.categories.find(c => c._id === id);
    return cat ? cat.name : '';
  }

  get filteredCategories(): any[] {
    if (!this.categorySearch.trim()) return this.categories;

    return this.categories.filter(c =>
      c.name.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  onOverlayClick(event: MouseEvent, type: 'menu' | 'category'): void {
    if ((event.target as HTMLElement).classList.contains('mn-modal-overlay')) {
      if (type === 'menu') this.closeModal();
      else this.closeCategoryModal();
    }
  }

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