import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuApiService } from '../../services/menu-api-services';
import { OrderApiService } from '../../services/order-api-services';
import { ActivatedRoute, Router } from '@angular/router';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  visible: boolean;
  removing: boolean;
}


export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;    
  foodType: 'VEG' | 'NON_VEG';
  isAvailable: boolean;
  image?: string;
  preparationTime?: number;

  added?: boolean;
  tag?: string;
  bg?: string;
  delay?: number;
}

declare const THREE: any;

@Component({
  selector: 'app-table-view-standard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tableviewStandard.html',
  styleUrls: ['./tableviewStandard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableViewStandardComponent
  implements OnInit, AfterViewInit, OnDestroy {

  toasts: Toast[] = [];
  private toastCounter = 0;
  hotel: any = {};
  branch: any = {};

  showToast(
    type: ToastType,
    title: string,
    message: string,
    duration = 3800
  ): void {
    const id = ++this.toastCounter;
    const toast: Toast = { id, type, title, message, visible: false, removing: false };

    this.toasts.push(toast);
    this.cdr.markForCheck();

    setTimeout(() => { toast.visible = true; this.cdr.markForCheck(); }, 20);
    setTimeout(() => this.dismissToast(id), duration);
  }

  dismissToast(id: number): void {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;

    toast.removing = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      this.cdr.markForCheck();
    }, 420);
  }

  trackToast(_: number, toast: Toast): number { return toast.id; }

  categories: { id: string; name: string }[] = [];
  activeCategory = 'All';
  searchQuery = '';
  activeFoodType: 'VEG' | 'NON_VEG' | null = null;
  searchFocused = false;
  menuItems: MenuItem[] = [];

  cart: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    foodType: 'VEG' | 'NON_VEG';
  }[] = [];

  isCartOpen = false;

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // ── Theme ─────────────────────────────────────────────────
  isDayMode = true;   

  @HostBinding('class.night-mode') get nightClass() { return !this.isDayMode; }
  @HostBinding('class.day-mode') get dayClass() { return this.isDayMode; }

  private animationId: number | null = null;
  private threeRenderer: any;
  private scene: any;
  private camera: any;
  private particleGeo: any;
  private particleMat: any;
  private particleMesh: any;
  private velocities: { x: number; y: number }[] = [];
  private frame = 0;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  tableToken!: string;

  constructor(
    private menuApi: MenuApiService,
    private orderApi: OrderApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tableToken = params['token']?.toLowerCase();

      if (!this.tableToken) {
        this.router.navigate(['/login']);
        return;
      }

      this.loadMenu();
    });
  }

  ngAfterViewInit(): void {
    this.initThreeBackground();
    this.initMouseTracking();
    this.initMobileTouch();
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.threeRenderer?.dispose();
  }


  loadMenu(category?: string): void {
    const params: any = {};

    if (category && category !== 'All') params.category = category;
    if (this.activeFoodType) params.foodType = this.activeFoodType;
    if (this.searchQuery.trim()) params.search = this.searchQuery.trim();

    this.menuApi.getMenuByTable(this.tableToken, params).subscribe({
      next: (res: any) => {
        this.hotel = res.hotel;
        this.branch = res.branch;
        this.menuItems = res.menu.map((item: any) => ({
          ...item,
          category: item.category?.name ?? item.category,
          added: false,
        }));

        this.categories = [
          { id: 'All', name: 'All' },
          ...res.categories.map((c: any) => ({ id: c._id, name: c.name })),
        ];

        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Menu fetch failed', err);
        this.showToast('error', 'Error', 'Could not load menu. Please try again.');
      },
    });
  }

  setCategory(cat: { id: string; name: string }): void {
    this.activeCategory = cat.id;
    this.loadMenu(cat.id === 'All' ? undefined : cat.id);
  }

  // ── Search / filter ───────────────────────────────────────

  onSearchInput(value: string): void {
    this.searchQuery = value;
    this.loadMenu(this.activeCategory !== 'All' ? this.activeCategory : undefined);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadMenu(this.activeCategory !== 'All' ? this.activeCategory : undefined);
  }

  cycleFoodType(): void {
    if (this.activeFoodType === null) this.activeFoodType = 'VEG';
    else if (this.activeFoodType === 'VEG') this.activeFoodType = 'NON_VEG';
    else this.activeFoodType = null;

    this.loadMenu(this.activeCategory !== 'All' ? this.activeCategory : undefined);
    this.cdr.detectChanges();
  }

  getToggleCoverClass(): string {
    if (this.activeFoodType === 'VEG') return 'cover-veg';
    if (this.activeFoodType === 'NON_VEG') return 'cover-nonveg';
    return 'cover-all';
  }


  addToOrder(item: MenuItem): void {
    const existing = this.cart.find(c => c.menuItemId === item._id);

    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        foodType: item.foodType,
      });
    }

    item.added = true;
    this.showToast('success', 'Added!', `${item.name} added to your order.`, 2000);

    setTimeout(() => { item.added = false; this.cdr.detectChanges(); }, 800);
    this.cdr.detectChanges();
  }

  increaseQty(item: any): void { item.quantity++; this.cdr.detectChanges(); }

  decreaseQty(item: any): void {
    if (item.quantity > 1) { item.quantity--; this.cdr.detectChanges(); }
  }

  removeItem(index: number): void {
    this.cart.splice(index, 1);
    this.cdr.detectChanges();
  }

  openCart(): void { this.isCartOpen = true; this.cdr.markForCheck(); }
  closeCart(): void { this.isCartOpen = false; this.cdr.markForCheck(); }

  closeCartOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('cart-overlay')) {
      this.closeCart();
    }
  }

  placeOrder(): void {
    if (!this.cart.length) return;

    const payload = {
      tableToken: this.tableToken,
      items: this.cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    };

    this.orderApi.createOrder(payload).subscribe({
      next: () => {
        this.showToast('success', 'Order Placed!', 'Your order is being prepared.');
        this.cart = [];
        this.closeCart();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Order creation failed', err);
        this.showToast('error', 'Order Failed', 'Something went wrong. Please try again.');
      },
    });
  }


  toggleTheme(): void {
    this.isDayMode = !this.isDayMode;
    document.body.classList.toggle('night-mode', !this.isDayMode);
    this.cdr.markForCheck();
  }


  private initThreeBackground(): void {
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('canvas-bg-std') as HTMLCanvasElement;
    if (!canvas) return;

    this.threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    this.buildParticles();
    this.buildDecorativeShapes();

    window.addEventListener('resize', this.onResize.bind(this));
    this.animate();
  }

  private buildParticles(): void {
    const count = 180;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.0015,
        y: (Math.random() - 0.5) * 0.002 + 0.0008,
      });
    }

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.particleMat = new THREE.PointsMaterial({
      color: 0x4caf5c,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleMesh = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particleMesh);
  }

  private decorShapes: any[] = [];

  private buildDecorativeShapes(): void {
    const wireMat = (opacity: number) =>
      new THREE.MeshBasicMaterial({
        color: 0x3a7d44,
        wireframe: true,
        transparent: true,
        opacity,
      });

    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), wireMat(0.04));
    ico.position.set(4.5, 1.5, -4);
    this.scene.add(ico);
    this.decorShapes.push({ mesh: ico, rx: 0.003, ry: 0.005 });

    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.25, 8, 24), wireMat(0.035));
    torus.position.set(-4.5, -1.5, -3);
    this.scene.add(torus);
    this.decorShapes.push({ mesh: torus, rx: 0.004, ry: -0.003 });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), wireMat(0.05));
    sphere.position.set(3, -2.5, -2);
    this.scene.add(sphere);
    this.decorShapes.push({ mesh: sphere, rx: -0.002, ry: 0.006 });
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.frame++;

    this.targetX += (this.mouseX - this.targetX) * 0.025;
    this.targetY += (this.mouseY - this.targetY) * 0.025;
    this.camera.position.x = this.targetX * 0.4;
    this.camera.position.y = -this.targetY * 0.25;

    const pos = this.particleGeo.attributes['position'].array as Float32Array;
    const count = pos.length / 3;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += this.velocities[i].y;
      pos[i * 3] += this.velocities[i].x;
      if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
      if (pos[i * 3] > 10) pos[i * 3] = -10;
      if (pos[i * 3] < -10) pos[i * 3] = 10;
    }
    this.particleGeo.attributes['position'].needsUpdate = true;

    this.particleMat.opacity = 0.20 + Math.sin(this.frame * 0.018) * 0.12;

    for (const s of this.decorShapes) {
      s.mesh.rotation.x += s.rx;
      s.mesh.rotation.y += s.ry;
    }

    this.threeRenderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  private initMouseTracking(): void {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  private initMobileTouch(): void {
    document.addEventListener('touchmove', (e: TouchEvent) => {
      if (!e.touches?.length) return;
      const t = e.touches[0];
      this.mouseX = (t.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (t.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }
}