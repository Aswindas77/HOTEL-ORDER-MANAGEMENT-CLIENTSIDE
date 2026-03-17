import { Component, OnInit, ChangeDetectorRef, HostListener, ViewEncapsulation, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MenuApiService } from './service/menu-api.service';
import { CategoryApiService } from './service/category-api.service';
import { FoodType } from '../../enums/food-type.enum';


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
    category: '' as any,
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

  get availableCount(): number { return this.menus.filter(m => m.isAvailable).length; }
  get unavailableCount(): number { return this.menus.filter(m => !m.isAvailable).length; }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  constructor(
    private menuApi: MenuApiService,
    private categoryApi: CategoryApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    const query = this.router.parseUrl(this.router.url).queryParams;

    if (query['page']) this.currentPage = Number(query['page']);
    if (query['category']) this.filters.category = query['category'];
    if (query['foodType']) this.filters.foodType = query['foodType'];
    if (query['search']) this.filters.search = query['search'];
    if (query['expanded']) this.expandedMenuId = query['expanded'];

    this.loadCategories();
    this.loadMenus();
  }



  loadMenus(): void {
    this.loading = true;

    const params: any = {};
    if (this.filters.search?.trim()) params.search = this.filters.search.trim();
    if (this.filters.category) params.category = this.filters.category;
    if (this.filters.foodType) params.foodType = this.filters.foodType;

    this.menuApi.getAdminMenus(params)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          const data = res ?? [];
          this.menus = [...data];
          this.totalPages = Math.ceil(data.length / this.pageSize);
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1;
          }
          this.updatePaginatedMenus();
        },
        error: () => {
          this.menus = [];
          this.paginatedMenus = [];
        },
      });
  }

  // ── Load categories ───────────────────────────────────────────

  loadCategories(): void {
    this.categoryApi.getCategories().subscribe({
      next: (res: any) => { this.categories = res; },
      error: () => { this.categories = []; },
    });
  }

  // ── Category CRUD ─────────────────────────────────────────────

  openCreateCategory(): void {
    this.categoryName = '';
    this.editingCategoryId = null;
    this.showCategoryModal = true;
    this.showModalCategoryDropdown = false;
  }

  editCategory(category: any): void {
    this.editingCategoryId = category._id;
    this.categoryName = category.name;
    this.showCategoryModal = true;
    this.showFilterCategoryDropdown = false;
    this.showModalCategoryDropdown = false;
  }

  deleteCategory(category: any): void {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    this.categoryApi.deleteCategory(category._id)
      .subscribe(() => this.loadCategories());
  }

  selectCategory(name: string): void {
    this.filters.category = name;
    this.showFilterCategoryDropdown = false;
    this.applyFilters();
  }

saveCategory(): void {
  if (!this.categoryName.trim()) return;

  const name = this.categoryName.trim();

  const action$ = this.editingCategoryId
    ? this.categoryApi.updateCategory(this.editingCategoryId, name)
    : this.categoryApi.createCategory(name);

  action$.subscribe(() => {
    this.loadCategories();

    // ✅ auto select in modal
    this.menuForm.category = name;

    this.closeCategoryModal();
    this.showModalCategoryDropdown = false;
  });
}

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  // ── Menu CRUD ─────────────────────────────────────────────────

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
      category: menu.category?.name || menu.category,
      foodType: menu.foodType,
      isAvailable: menu.isAvailable,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMenu(): void {
    const payload = {
      name: this.menuForm.name,
      description: this.menuForm.description,
      price: Number(this.menuForm.price),
      category: this.menuForm.category,
      foodType: this.menuForm.foodType,
      isAvailable: true,
    };

    const request$ = this.editingMenuId
      ? this.menuApi.updateMenu(this.editingMenuId, payload)
      : this.menuApi.createMenu(payload);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadMenus(); },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Failed to save menu item');
      },
    });
  }

  get filteredCategories(): any[] {
  if (!this.categorySearch.trim()) return this.categories;

  return this.categories.filter(c =>
    c.name.toLowerCase().includes(this.categorySearch.toLowerCase())
  );
}

  // ── Toggle availability ───────────────────────────────────────

  toggleAvailability(menu: any): void {
    const request$ = menu.isAvailable
      ? this.menuApi.disableMenu(menu._id)
      : this.menuApi.enableMenu(menu._id);

    request$.subscribe({
      next: () => {
        this.menus = this.menus.map(m =>
          m._id === menu._id ? { ...m, isAvailable: !m.isAvailable } : m
        );
        this.updatePaginatedMenus();
        this.cdr.detectChanges();
      },
      error: () => alert('Failed to update status'),
    });
  }

  // ── Filters ───────────────────────────────────────────────────

  applyFilters(): void {
    this.currentPage = 1;
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage,
        search: this.filters.search || null,
        category: this.filters.category || null,
        foodType: this.filters.foodType || null,
      },
      queryParamsHandling: 'merge',
    });
    this.loadMenus();
  }

  clearFilters(): void {
    this.filters = { search: '', category: '', foodType: '' };
    this.currentPage = 1;
    this.applyFilters();
  }

  // ── Pagination ────────────────────────────────────────────────

  updatePaginatedMenus(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedMenus = this.menus.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.router.navigate([], {
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
    this.updatePaginatedMenus();
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }

  // ── Expand / collapse row ─────────────────────────────────────

  toggleExpand(menuId: string): void {
    this.expandedMenuId = this.expandedMenuId === menuId ? null : menuId;
    this.router.navigate([], {
      queryParams: { expanded: this.expandedMenuId || null },
      queryParamsHandling: 'merge',
    });
  }

  // ── Modal overlay click (close on backdrop) ───────────────────

  onOverlayClick(event: MouseEvent, type: 'menu' | 'category'): void {
    if ((event.target as HTMLElement).classList.contains('mn-modal-overlay')) {
      type === 'menu' ? this.closeModal() : this.closeCategoryModal();
    }
  }

  // ── Close category dropdown when clicking outside ─────────────

onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  // ✅ Allow clicks inside dropdown
  if (target.closest('.mn-cat-drop') || target.closest('.mn-cat-menu')) {
    return;
  }

  this.showFilterCategoryDropdown = false;
  this.showModalCategoryDropdown = false;
}

  // ── Keyboard: close modals on Escape ─────────────────────────

  // @HostListener('document:keydown.escape')
  // onEscape(): void {
  //   if (this.showModal) this.closeModal();
  //   if (this.showCategoryModal) this.closeCategoryModal();
  //   this.showModalCategoryDropdown = false;
  // }

  // ── Reset form ────────────────────────────────────────────────

  private resetForm(): void {
    this.menuForm = {
      name: '', description: '', price: '' as any,
      category: '' as any, foodType: '' as any, isAvailable: true,
    };
  }
}