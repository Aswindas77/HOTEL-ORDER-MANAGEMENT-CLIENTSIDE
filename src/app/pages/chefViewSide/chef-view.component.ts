import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe, UpperCasePipe, DecimalPipe } from '@angular/common';
import { OrderApiService } from '../../services/order-api-services';
import { Order } from '../../models/order.model';

declare const THREE: any;

interface FilterOption {
    key: string;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-chef-orders',
    standalone: true,
    imports: [CommonModule, DatePipe, SlicePipe, UpperCasePipe, DecimalPipe],
    templateUrl: './chef-orders.component.html',
    styleUrls: ['./chef-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChefOrdersComponent implements OnInit, AfterViewInit, OnDestroy {

    // ── State ──────────────────────────────────────────────────────────────────

    orders: Order[] = [];
    loading = false;
    activeFilter = 'PENDING';
    today = new Date();

    // Pagination
    page = 1;
    limit = 12;
    totalPages = 1;

    // Filters
    search = '';
    startDate?: string;
    endDate?: string;

    // Full status workflow
    readonly statusSteps = ['PENDING', 'PREPARING', 'READY'];

    filterOptions: FilterOption[] = [
        { key: 'PENDING', label: 'Pending', icon: '◇' },
        { key: 'PREPARING', label: 'Preparing', icon: '◉' },
        { key: 'READY', label: 'Ready', icon: '✦' },
    ];

    // ── Three.js refs ──────────────────────────────────────────────────────────

    private animationId: number | null = null;
    private renderer: any;
    private scene: any;
    private camera: any;
    private particleGeo: any;
    private particleMat: any;
    private particles: any;
    private velocities: { x: number; y: number }[] = [];
    private diamond: any;
    private diamond2: any;
    private torus: any;
    private frame = 0;
    private mouseX = 0;
    private mouseY = 0;
    private targetX = 0;
    private targetY = 0;
    private pollInterval: any;

    constructor(
        private orderApi: OrderApiService,
        private cdr: ChangeDetectorRef
    ) { }

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.loadOrders();
        this.pollInterval = setInterval(() => this.loadOrders(), 15_000);
    }

    ngAfterViewInit(): void {
        this.initThreeBackground();
        this.initCssParticles();
        this.initMouseTracking();
    }

    ngOnDestroy(): void {
        if (this.animationId !== null) cancelAnimationFrame(this.animationId);
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.renderer?.dispose();
    }

    // ── Data ───────────────────────────────────────────────────────────────────

    loadOrders(): void {
        this.loading = true;

        const params: any = { page: this.page, limit: this.limit };
        if (this.search) params.search = this.search;
        if (this.activeFilter !== 'ALL') params.status = this.activeFilter;
        if (this.startDate) params.startDate = this.startDate;
        if (this.endDate) params.endDate = this.endDate;

        this.orderApi.getChefOrders(params).subscribe({
            next: (res: any) => {
                this.orders = res.data ?? res;
                this.totalPages = res.totalPages ?? 1;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load orders:', err);
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    updateStatus(order: Order, status: string): void {
        this.orderApi.updateOrderStatus(order._id, status).subscribe({
            next: () => this.loadOrders(),
            error: (err) => console.error('Status update failed:', err)
        });
    }

    // ── Computed ───────────────────────────────────────────────────────────────

    get filteredOrders(): Order[] {
        return this.orders;
    }

    get pendingCount(): number {
        return this.orders.filter(o => o.status === 'PENDING').length;
    }

    get preparingCount(): number {
        return this.orders.filter(o => o.status === 'PREPARING').length;
    }

    get readyCount(): number {
        return this.orders.filter(o => o.status === 'READY').length;
    }

    // ── Filter / Search / Dates ────────────────────────────────────────────────

    setFilter(key: string): void {
        this.activeFilter = key;
        this.page = 1;
        this.loadOrders();
    }

    onSearch(value: string): void {
        this.search = value;
        this.page = 1;
        this.loadOrders();
    }

    setStartDate(date: string): void {
        this.startDate = date;
        this.page = 1;
        this.loadOrders();
    }

    setEndDate(date: string): void {
        this.endDate = date;
        this.page = 1;
        this.loadOrders();
    }

    clearDates(): void {
        this.startDate = undefined;
        this.endDate = undefined;
        this.page = 1;
        this.loadOrders();
    }

    // ── Pagination ─────────────────────────────────────────────────────────────

    nextPage(): void {
        if (this.page < this.totalPages) { this.page++; this.loadOrders(); }
    }

    prevPage(): void {
        if (this.page > 1) { this.page--; this.loadOrders(); }
    }

    // ── Status helpers ─────────────────────────────────────────────────────────

    getNextStatus(status: string): string | null {

        if (status === 'PENDING') return 'PREPARING';

        if (status === 'PREPARING') return 'READY';
        return null;
    }

    /** Returns true if the order has passed through this step */
    isStatusDone(currentStatus: string, step: string): boolean {
        const currentIdx = this.statusSteps.indexOf(currentStatus);
        const stepIdx = this.statusSteps.indexOf(step);
        return stepIdx < currentIdx;
    }

    getTotalItems(order: Order): number {
        return order.items.reduce((sum, i) => sum + i.quantity, 0);
    }

    getCountForFilter(key: string): number {
        if (key === 'ALL') return this.orders.length;
        return this.orders.filter(o => o.status === key).length;
    }

    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'status-pending',
            PREPARING: 'status-preparing',
            READY: 'status-ready',
            SERVED: 'status-served',
            COMPLETED: 'status-completed',
        };
        return map[status] ?? '';
    }

    getActionClass(nextStatus: string): string {
        const map: Record<string, string> = {
            PREPARING: 'btn-preparing',
            READY: 'btn-ready',
        };
        return map[nextStatus] ?? '';
    }

    getActionIcon(nextStatus: string): string {
        const map: Record<string, string> = {
            PREPARING: '◉',
            READY: '✦',
        };
        return map[nextStatus] ?? '→';
    }

    getActionLabel(nextStatus: string): string {
        const map: Record<string, string> = {
            PREPARING: 'Start Prep',
            READY: 'Mark Ready',
        };
        return map[nextStatus] ?? nextStatus;
    }

    getStepLabel(step: string): string {
        const map: Record<string, string> = {
            PENDING: 'Pending',
            PREPARING: 'Prep',
            READY: 'Ready',
            SERVED: 'Served',
            COMPLETED: 'Done',
        };
        return map[step] ?? step;
    }

    // ── Three.js ───────────────────────────────────────────────────────────────

    private initThreeBackground(): void {
        if (typeof THREE === 'undefined') return;
        const canvas = document.getElementById('chef-canvas-bg') as HTMLCanvasElement;
        if (!canvas) return;

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
            color: 0xc9a84c, size: 0.04, transparent: true, opacity: 0.5,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });

        this.particles = new THREE.Points(this.particleGeo, this.particleMat);
        this.scene.add(this.particles);
    }

    private buildGeometry(): void {
        const wireMat = (opacity: number) =>
            new THREE.MeshBasicMaterial({ color: 0xc9a84c, wireframe: true, transparent: true, opacity });

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
        const lineMat = new THREE.LineBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.025 });
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-15, -6 + i * 1.8, -5),
                new THREE.Vector3(15, -6 + i * 1.8, -5),
            ]);
            this.scene.add(new THREE.Line(geo, lineMat));
        }
    }

    private animate(): void {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.frame++;

        this.targetX += (this.mouseX - this.targetX) * 0.03;
        this.targetY += (this.mouseY - this.targetY) * 0.03;

        this.camera.position.x = this.targetX * 0.5;
        this.camera.position.y = -this.targetY * 0.3;

        const pos = this.particleGeo.attributes['position'].array as Float32Array;
        for (let i = 0; i < pos.length / 3; i++) {
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

    private initMouseTracking(): void {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    private initCssParticles(): void {
        const container = document.getElementById('chef-particles');
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