import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; import * as THREE from 'three';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-activation-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activation-pending.component.html',
  styleUrls: ['./activation-pending.component.scss'],
})
export class ActivationPendingComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvasContainer', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private rafId!: number;
  private mouse = { x: 0, y: 0 };
  private resizeObs!: ResizeObserver;

  private starPoints!: THREE.Points;
  private rings: THREE.Mesh[] = [];
  private orbGroup!: THREE.Group;
  private coreGroup!: THREE.Group;
  private trailGroup!: THREE.Group;

  specks = Array.from({ length: 18 }, () => this.makeSpeck());

  btnParticles = Array.from({ length: 8 }, (_, i) => ({
    '--angle': `${i * 45}deg`,
    '--delay': `${i * 0.08}s`,
  }));

  status: 'pending' | 'approved' | 'rejected' = 'pending';

  pageContent = {
    pending: {
      title: 'Activation Under Review',
      subtitle: 'Your request is being reviewed.',
      reviewText: `Our admin team is reviewing your activation request.
    This usually takes 2–3 days.`,
      buttonText: 'Back to Login'
    },
    approved: {
      title: 'Activation Approved',
      subtitle: 'Your hotel is now live.',
      reviewText: `You can now login and access your dashboard.`,
      buttonText: 'Back to Login'
    },
    rejected: {
      title: 'Activation Rejected',
      subtitle: 'Your request was not approved.',
      reviewText: `Please contact support or try again.`,
      buttonText: 'Back to Login'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authApi: AuthApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.authApi.getProfile().subscribe((user: any) => {

      this.authApi.getMyActivationRequest().subscribe((res: any) => {

        console.log('MY REQUEST 👉', res);

        const reqStatus = res?.status;

        this.status = reqStatus || 'pending';
        this.cdr.detectChanges();
      });

    });

  }

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
    this.bindEvents();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObs?.disconnect();
    this.renderer?.dispose();
    window.removeEventListener('mousemove', this.onMouse);
  }

  private makeSpeck() {
    const size = 2 + Math.random() * 4;
    return {
      '--x': `${Math.random() * 100}vw`,
      '--delay': `${Math.random() * 12}s`,
      '--dur': `${10 + Math.random() * 16}s`,
      '--size': `${size}px`,
      '--op': `${0.15 + Math.random() * 0.35}`,
    };
  }

  private initThree(): void {
    const el = this.canvasRef.nativeElement;
    const W = el.clientWidth || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
    this.camera.position.z = 7;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(W, H);
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);

    this.buildStarField();
    this.buildRings();
    this.buildOrbs();
    this.buildCore();
    this.buildTrails();
    this.buildNebulaClouds();
  }

  private buildStarField(): void {
    const count = 3600;
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 110;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 110;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      sizes[i] = Math.random() * 0.07 + 0.008;
      phase[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phase, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0xC9A84C) },
        uColor2: { value: new THREE.Color(0xFAD97A) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        uniform   float uTime;
        varying   float vAlpha;
        varying   float vPhase;
        void main() {
          vPhase      = aPhase;
          vAlpha      = 0.20 + 0.40 * sin(uTime * 0.6 + aPhase);
          vec4 mvPos  = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize  = aSize * (300.0 / -mvPos.z);
          gl_Position   = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3  uColor1;
        uniform vec3  uColor2;
        varying float vAlpha;
        varying float vPhase;
        void main() {
          float d   = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;
          float a   = smoothstep(1.0, 0.0, d) * vAlpha;
          vec3  col = mix(uColor1, uColor2, sin(vPhase) * 0.5 + 0.5);
          gl_FragColor = vec4(col, a);
        }
      `,
    });

    this.starPoints = new THREE.Points(geo, mat);
    this.scene.add(this.starPoints);
  }

  private buildRings(): void {
    const cfgs = [
      { r: 2.8, tube: 0.014, color: 0xC9A84C, op: 0.40, rx: 1.10, ry: 0.30, sp: 0.11, d: 1 },
      { r: 3.7, tube: 0.009, color: 0xB8922E, op: 0.26, rx: 0.50, ry: 1.20, sp: 0.07, d: -1 },
      { r: 2.0, tube: 0.018, color: 0xFAD97A, op: 0.33, rx: -0.70, ry: 0.90, sp: 0.16, d: 1 },
      { r: 4.5, tube: 0.007, color: 0x8B6914, op: 0.18, rx: 1.50, ry: -0.40, sp: 0.05, d: 1 },
      { r: 1.4, tube: 0.021, color: 0xE8C56A, op: 0.28, rx: -0.30, ry: -1.10, sp: 0.20, d: -1 },
      { r: 5.2, tube: 0.005, color: 0xC9A84C, op: 0.12, rx: 0.20, ry: 0.60, sp: 0.03, d: 1 },
    ];

    cfgs.forEach(c => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(c.r, c.tube, 8, 180),
        new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: c.op }),
      );
      mesh.rotation.x = c.rx;
      mesh.rotation.y = c.ry;
      mesh.userData = { sp: c.sp, d: c.d };
      this.scene.add(mesh);
      this.rings.push(mesh);
    });
  }

  private buildOrbs(): void {
    this.orbGroup = new THREE.Group();
    this.scene.add(this.orbGroup);

    for (let i = 0; i < 28; i++) {
      const r = 0.035 + Math.random() * 0.095;
      const hue = 0.095 + Math.random() * 0.065;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 12, 12),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(hue, 0.80, 0.48 + Math.random() * 0.24),
          transparent: true,
          opacity: 0.38 + Math.random() * 0.40,
        }),
      );
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const rad = 1.4 + Math.random() * 3.2;
      mesh.position.set(
        rad * Math.sin(phi) * Math.cos(theta),
        rad * Math.sin(phi) * Math.sin(theta),
        (Math.random() - 0.5) * 4.5,
      );
      mesh.userData = { offset: Math.random() * Math.PI * 2, speed: 0.25 + Math.random() * 1.0 };
      this.orbGroup.add(mesh);
    }
  }

  private buildCore(): void {
    this.coreGroup = new THREE.Group();
    this.scene.add(this.coreGroup);

    [
      { r: 0.30, color: 0xC9A84C, op: 0.13 },
      { r: 0.20, color: 0xE8C56A, op: 0.24 },
      { r: 0.10, color: 0xFAD97A, op: 0.42 },
      { r: 0.05, color: 0xFFFFFF, op: 0.55 },
    ].forEach(c => {
      this.coreGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(c.r, 32, 32),
        new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: c.op }),
      ));
    });
  }

  private buildTrails(): void {
    this.trailGroup = new THREE.Group();
    this.scene.add(this.trailGroup);

    for (let i = 0; i < 12; i++) {
      const points: THREE.Vector3[] = [];
      const startTheta = Math.random() * Math.PI * 2;
      const r = 2.0 + Math.random() * 2.5;

      for (let j = 0; j <= 40; j++) {
        const t = j / 40;
        const theta = startTheta + t * (Math.PI * 0.35 + Math.random() * 0.5);
        const phi = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;
        points.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.6,
          r * Math.cos(phi) * 0.5,
        ));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0xC9A84C,
        transparent: true,
        opacity: 0.08 + Math.random() * 0.10,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { speed: 0.006 + Math.random() * 0.01, offset: Math.random() * Math.PI * 2 };
      this.trailGroup.add(line);
    }
  }

  private buildNebulaClouds(): void {
    for (let i = 0; i < 8; i++) {
      const size = 4 + Math.random() * 5;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({
          color: 0xC9A84C,
          transparent: true,
          opacity: 0.008 + Math.random() * 0.014,
          depthWrite: false,
        }),
      );
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
      );
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.userData = { drift: 0.0004 + Math.random() * 0.001, breathe: Math.random() * Math.PI * 2 };
      this.scene.add(mesh);
    }
  }

  private animate = (): void => {
    this.rafId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    const starMat = this.starPoints.material as THREE.ShaderMaterial;
    starMat.uniforms['uTime'].value = t;
    this.starPoints.rotation.y += 0.00020;
    this.starPoints.rotation.x += 0.00005;

    this.rings.forEach((r, i) => {
      r.rotation.z += r.userData['sp'] * r.userData['d'] * 0.004;
      const breathe = 1 + 0.025 * Math.sin(t * 0.4 + i * 1.1);
      r.scale.setScalar(breathe);
    });

    this.orbGroup.rotation.y = t * 0.052;
    this.orbGroup.rotation.x = Math.sin(t * 0.18) * 0.12;
    this.orbGroup.children.forEach(c => {
      const m = c as THREE.Mesh;
      m.position.y += Math.sin(t * m.userData['speed'] + m.userData['offset']) * 0.0016;
    });

    const cp = 1 + 0.10 * Math.sin(t * 2.2);
    this.coreGroup.scale.setScalar(cp);
    this.coreGroup.rotation.y = t * 0.3;

    this.trailGroup.children.forEach(c => {
      const l = c as THREE.Line;
      const mat = l.material as THREE.LineBasicMaterial;
      mat.opacity = (0.06 + 0.08 * Math.sin(t * l.userData['speed'] * 80 + l.userData['offset']));
      l.rotation.y += l.userData['speed'];
    });

    this.scene.children.forEach(obj => {
      if (obj.userData['breathe'] !== undefined) {
        const m = obj as THREE.Mesh;
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.008 + 0.008 * Math.sin(t * 0.5 + obj.userData['breathe']);
        obj.rotation.z += obj.userData['drift'];
      }
    });

    this.camera.position.x += (this.mouse.x * 0.45 - this.camera.position.x) * 0.032;
    this.camera.position.y += (this.mouse.y * 0.30 - this.camera.position.y) * 0.032;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  };

  private onMouse = (e: MouseEvent): void => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  private bindEvents(): void {
    window.addEventListener('mousemove', this.onMouse);
    this.resizeObs = new ResizeObserver(() => {
      const el = this.canvasRef.nativeElement;
      const W = el.clientWidth;
      const H = el.clientHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H);
    });
    this.resizeObs.observe(this.canvasRef.nativeElement);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}