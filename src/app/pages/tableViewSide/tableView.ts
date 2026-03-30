import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuApiService } from '../../services/menu-api-services';
import { OrderApiService } from '../../services/order-api-services';
import { ActivatedRoute, Router } from '@angular/router';
import { Renderer2 } from '@angular/core';
import { HostBinding } from '@angular/core';


export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
    visible: boolean;
    removing: boolean;
}


// ── Interfaces ────────────────────────────────────────────────────────────────

export interface MenuItem {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: { _id: string; name: string };
    foodType: 'VEG' | 'NON_VEG';
    isAvailable: boolean;
    image?: string;
    preparationTime?: number;

    // UI-only properties
    added?: boolean;
    tag?: string;
    bg?: string;
    delay?: number;
}



// ── Three.js ambient type (loaded via CDN) ────────────────────────────────────
declare const THREE: any;

@Component({
    selector: 'app-table-view',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tableView.html',
    styleUrls: ['./tableView.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableViewComponent implements OnInit, AfterViewInit, OnDestroy {


    toasts: Toast[] = [];
    private toastCounter = 0;
    hotel: any = {};
    branch: any = {};

    showToast(type: ToastType, title: string, message: string, duration = 3800): void {

        const id = ++this.toastCounter;

        const toast: Toast = {
            id,
            type,
            title,
            message,
            visible: false,
            removing: false
        };

        this.toasts.push(toast);
        this.cdr.markForCheck();

        setTimeout(() => {
            toast.visible = true;
            this.cdr.markForCheck();
        }, 20);

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

    trackToast(_: number, toast: Toast): number {
        return toast.id;
    }
    // ── State ────────────────────────────────────────────────────────────────

    categories: { id: string; name: string }[] = [];
    activeCategory: string = 'All';
    searchQuery = '';
    activeFoodType: 'VEG' | 'NON_VEG' | null = null;
    searchFocused = false;


    featureItem = {
        id: 0,
        title: 'Atlantic Lobster Thermidor',
        filterKey: 'Mains',
        added: false,
    };

    menuItems: MenuItem[] = []

    // cart
    cart: {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
        foodType: 'VEG' | 'NON_VEG';
    }[] = [];

    // ── Computed ─────────────────────────────────────────────────────────────

    get showAll(): boolean {
        return this.activeCategory === 'All';
    }

    isCartOpen = false;


    // cart total

    get cartTotal(): number {
        return this.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }
    // get filteredItems(): MenuItem[] {
    //     if (this.activeCategory === 'All') return this.menuItems;
    //     return this.menuItems.filter(item => item.filterKey === this.activeCategory);
    // }

    // ── Three.js / Animation refs ─────────────────────────────────────────────

    private animationId: number | null = null;
    private renderer: any;
    private scene: any;
    private camera: any;
    private particles: any;
    private particleGeo: any;
    private particleMat: any;
    private velocities: { x: number; y: number }[] = [];
    private diamond: any;
    private diamond2: any;
    private torus: any;
    private frame = 0;
    private mouseX = 0;
    private mouseY = 0;
    private targetX = 0;
    private targetY = 0;
    tableToken!: string;
    isDayMode = false;

    private boundMouseMove!: (e: MouseEvent) => void;

    constructor
        (
            private menuApi: MenuApiService,
            private orderApi: OrderApiService,
            private route: ActivatedRoute,
            private router: Router,
            private cdr: ChangeDetectorRef
        ) { }

    // ── Lifecycle ────────────────────────────────────────────────────────────

    ngOnInit(): void {

        this.route.queryParams.subscribe(params => {
            this.tableToken = params['token']?.toLowerCase();

            if (!this.tableToken) {
                // this.showToast(
                //     'error',
                //     'Access Denied',
                //     'Invalid table token. Please scan the QR code again.'
                // );
                this.router.navigate(['/login']);


                return;
            }

            console.log('Token:', this.tableToken);
            this.loadMenu();
        });


    }

    ngAfterViewInit(): void {
        this.initThreeBackground();
        this.initCssParticles();
        this.initMouseTracking();
        this.initMobileTouch();
    }

    ngOnDestroy(): void {
        if (this.animationId !== null) cancelAnimationFrame(this.animationId);
        document.removeEventListener('mousemove', this.boundMouseMove);
        this.renderer?.dispose();
    }

    loadMenu(category?: string) {
        const params: any = {};

        if (category && category !== 'All') {
            params.category = category;
        }
        if (this.activeFoodType) params.foodType = this.activeFoodType;
        if (this.searchQuery.trim()) params.search = this.searchQuery.trim();

        this.menuApi.getMenuByTable(this.tableToken, params)
            .subscribe({
                next: (res: any) => {


                    this.menuItems = res.menu.map((item: any) => ({
                        ...item,
                        category: item.category.name,
                        added: false
                    }));

                    this.categories = [
                        { id: 'All', name: 'All' },
                        ...res.categories.map((c: any) => ({
                            id: c._id,
                            name: c.name
                        }))
                    ];
                    this.hotel = res.hotel || {};
                    this.branch = res.branch || {};
                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Menu fetch failed', err)
            });
    }

    setCategory(cat: any) {
        this.activeCategory = cat.id;

        if (cat.id === 'All') {
            this.loadMenu();
        } else {
            this.loadMenu(cat.id);
        }
    }


    //order category section 

    addToOrder(item: MenuItem): void {

        const existing = this.cart.find(
            c => c.menuItemId === item._id
        );

        if (existing) {
            existing.quantity++;
        } else {
            this.cart.push({
                menuItemId: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                foodType: item.foodType
            });
        }

        item.added = true;

        setTimeout(() => {
            item.added = false;
            this.cdr.markForCheck();
        }, 800);

        this.cdr.markForCheck();
    }

    @HostBinding('class.day-mode') get dayModeClass() {
        return this.isDayMode;
    }
    placeOrder() {

        if (this.cart.length === 0) return;

        const payload = {
            tableToken: this.tableToken,
            items: this.cart.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity
            }))
        };

        this.orderApi.createOrder(payload).subscribe({
            next: (res) => {

                alert('order created successfully')

                this.cart = [];
                this.closeCart();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Order creation failed:', err);
                this.showToast(
                    'error',
                    'Order Failed',
                    'Something went wrong. Please try again.'
                );
            }
        });
    }

    openCart() {
        this.isCartOpen = true;
    }

    closeCart() {
        this.isCartOpen = false;
    }

    removeItem(index: number) {
        this.cart.splice(index, 1);
    }

    increaseQty(item: any) {
        item.quantity++;
    }

    decreaseQty(item: any) {
        if (item.quantity > 1) {
            item.quantity--;
        }
    }

    closeCartOnBackdrop(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains('cart-overlay')) {
            this.closeCart();
        }
    }



    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.loadMenu(this.activeCategory);
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.loadMenu(this.activeCategory);
    }

    toggleFoodType(type: 'VEG' | 'NON_VEG'): void {
        // Tap same pill again → deselect (show all)
        this.activeFoodType = this.activeFoodType === type ? null : type;
        this.loadMenu(this.activeCategory);
    }

    toggleTheme(): void {
        this.isDayMode = !this.isDayMode;

        document.body.classList.toggle('day-mode', this.isDayMode);
    }
    cycleFoodType(): void {
        if (this.activeFoodType === null) this.activeFoodType = 'VEG';
        else if (this.activeFoodType === 'VEG') this.activeFoodType = 'NON_VEG';
        else this.activeFoodType = null;

        this.loadMenu(this.activeCategory);
        this.cdr.markForCheck();
    }

    getFoodTypeSliderClass(): string {
        if (this.activeFoodType === 'VEG') return 'glow-veg';
        if (this.activeFoodType === 'NON_VEG') return 'glow-nonveg';
        return 'glow-all';
    }

    ycleFoodType(): void {
        if (this.activeFoodType === null) this.activeFoodType = 'VEG';
        else if (this.activeFoodType === 'VEG') this.activeFoodType = 'NON_VEG';
        else this.activeFoodType = null;

        this.loadMenu(this.activeCategory);
        this.cdr.markForCheck();
    }

    getToggleCoverClass(): string {
        if (this.activeFoodType === 'VEG') return 'cover-veg';
        if (this.activeFoodType === 'NON_VEG') return 'cover-nonveg';
        return 'cover-all';
    }


    // ── Three.js Background ──────────────────────────────────────────────────

    private initThreeBackground(): void {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded. Add CDN script to index.html.');
            return;
        }

        const canvas = document.getElementById('canvas-bg') as HTMLCanvasElement;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 0, 5);
        this.scene.fog = new THREE.FogExp2(0x0a0a08, 0.08);

        this.buildParticles();
        this.buildGeometry();
        this.buildGridLines();

        window.addEventListener('resize', this.onResize.bind(this));
        this.animate();
    }

    private buildParticles(): void {
        const count = 300;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            sizes[i] = Math.random() * 0.06 + 0.01;
            this.velocities.push({
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.003 + 0.001,
            });
        }

        this.particleGeo = new THREE.BufferGeometry();
        this.particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        this.particleMat = new THREE.PointsMaterial({
            color: 0xc9a84c,
            size: 0.04,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.particles = new THREE.Points(this.particleGeo, this.particleMat);
        this.scene.add(this.particles);
    }

    private buildGeometry(): void {
        const wireMat = (opacity: number) =>
            new THREE.MeshBasicMaterial({
                color: 0xc9a84c,
                wireframe: true,
                transparent: true,
                opacity,
            });

        this.diamond = new THREE.Mesh(new THREE.OctahedronGeometry(1.8, 0), wireMat(0.04));
        this.diamond.position.set(4, 1, -3);
        this.scene.add(this.diamond);

        this.diamond2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), wireMat(0.06));
        this.diamond2.position.set(-5, -2, -2);
        this.scene.add(this.diamond2);

        this.torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.3, 80, 16), wireMat(0.025));
        this.torus.position.set(-3.5, 2, -4);
        this.scene.add(this.torus);
    }

    private buildGridLines(): void {
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xc9a84c,
            transparent: true,
            opacity: 0.03,
        });
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-15, -6 + i * 1.8, -5),
                new THREE.Vector3(15, -6 + i * 1.8, -5),
            ]);
            this.scene.add(new THREE.Line(geo, lineMat));
        }
    }

    get showFeature(): boolean {
        return (
            this.activeCategory === 'All' ||
            this.activeCategory === 'MAIN_COURSE'
        );
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.frame++;

        this.targetX += (this.mouseX - this.targetX) * 0.03;
        this.targetY += (this.mouseY - this.targetY) * 0.03;

        this.camera.position.x = this.targetX * 0.5;
        this.camera.position.y = -this.targetY * 0.3;

        // Animate particles
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

        this.diamond.rotation.y += 0.003;
        this.diamond.rotation.x += 0.001;
        this.diamond2.rotation.y -= 0.002;
        this.diamond2.rotation.z += 0.001;
        this.torus.rotation.x += 0.003;
        this.torus.rotation.y += 0.002;

        this.particleMat.opacity = 0.3 + Math.sin(this.frame * 0.02) * 0.15;

        this.renderer.render(this.scene, this.camera);
    }

    private onResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // ── Custom Cursor ────────────────────────────────────────────────────────

    private initMouseCursor(): void {
        const cursor = document.getElementById('cursor')!;
        const cursorRing = document.getElementById('cursor-ring')!;

        this.boundMouseMove = (e: MouseEvent) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorRing.style.left = e.clientX + 'px';
            cursorRing.style.top = e.clientY + 'px';

            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        document.addEventListener('mousemove', this.boundMouseMove);
    }

    private initMouseTracking(): void {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    private initMobileTouch(): void {
        document.addEventListener('touchmove', (e: TouchEvent) => {

            if (!e.touches || e.touches.length === 0) return;

            const touch = e.touches[0];

            this.mouseX = (touch.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (touch.clientY / window.innerHeight - 0.5) * 2;

        }, { passive: true });
    }

    private initCursorHover(): void {
        const cursor = document.getElementById('cursor')!;
        const cursorRing = document.getElementById('cursor-ring')!;

        document.querySelectorAll<HTMLElement>('button, a, .menu-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('expanded');
                cursorRing.classList.add('expanded');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('expanded');
                cursorRing.classList.remove('expanded');
            });
        });
    }

    // ── CSS Particles ────────────────────────────────────────────────────────

    private initCssParticles(): void {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = 8 + Math.random() * 12 + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            p.style.opacity = String(Math.random() * 0.5);
            container.appendChild(p);
        }
    }
}