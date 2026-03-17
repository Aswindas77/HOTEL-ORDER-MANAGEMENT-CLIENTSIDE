// analytics.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsApiService } from './service/analytics-api.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit {

  data: any = null;

  /** SVG circumference for r=30 ring: 2π × 30 ≈ 188.5 */
  private readonly RING_CIRC   = 188.5;

  /** SVG circumference for r=50 health ring: 2π × 50 ≈ 314.2 */
  private readonly HEALTH_CIRC = 314.2;

  constructor(
    private analyticsApi: AnalyticsApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  // ── Data loading ──────────────────────────────────────────
  loadAnalytics(): void {
    this.analyticsApi.getAnalytics().subscribe({
      next: (res: any) => {
        this.data = res;
        this.cdr.detectChanges();
      },
      error: err => console.error('Analytics error', err),
    });
  }

  // ── Date display ──────────────────────────────────────────
  get today(): string {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ── Aggregates ────────────────────────────────────────────

  get totalRequests(): number {
    const r = this.data?.activationRequests;
    if (!r) return 0;
    return (r.pending || 0) + (r.approved || 0) + (r.rejected || 0);
  }

  get totalSubscriptions(): number {
    const s = this.data?.subscriptions;
    if (!s) return 0;
    return (s.premium || 0) + (s.standard || 0) + (s.classic || 0);
  }

  get avgBranchesPerHotel(): string {
    if (!this.data?.hotels || this.data.hotels === 0) return '0';
    return (this.data.branches / this.data.hotels).toFixed(1);
  }

  get avgUsersPerHotel(): string {
    if (!this.data?.hotels || this.data.hotels === 0) return '0';
    return (this.data.users / this.data.hotels).toFixed(1);
  }

  // ── Request percentages ───────────────────────────────────

  getReqPct(type: 'pending' | 'approved' | 'rejected'): number {
    if (!this.totalRequests) return 0;
    const val = this.data?.activationRequests?.[type] || 0;
    return Math.round((val / this.totalRequests) * 100);
  }

  get approvalRate(): number {
    if (!this.totalRequests) return 0;
    const approved = this.data?.activationRequests?.approved || 0;
    return Math.round((approved / this.totalRequests) * 100);
  }

  // ── Subscription ring dash ────────────────────────────────

  /** Returns stroke-dasharray value for a subscription ring (r=30, circ≈188.5) */
  getRingDash(type: 'premium' | 'standard' | 'classic'): string {
    if (!this.totalSubscriptions) return `0 ${this.RING_CIRC}`;
    const val  = this.data?.subscriptions?.[type] || 0;
    const pct  = val / this.totalSubscriptions;
    const fill = pct * this.RING_CIRC;
    return `${fill} ${this.RING_CIRC - fill}`;
  }

  getSubPct(type: 'premium' | 'standard' | 'classic'): number {
    if (!this.totalSubscriptions) return 0;
    const val = this.data?.subscriptions?.[type] || 0;
    return Math.round((val / this.totalSubscriptions) * 100);
  }

  // ── Platform Health Score ─────────────────────────────────

  /**
   * Composite score (0–100) based on:
   *  - Approval rate (40 pts)
   *  - Premium subscription share (30 pts)
   *  - Hotels > 0 check (15 pts)
   *  - Users > 10 check (15 pts)
   */
  get healthScore(): number {
    if (!this.data) return 0;

    let score = 0;

    // Approval rate contributes up to 40 pts
    score += (this.approvalRate / 100) * 40;

    // Premium share contributes up to 30 pts
    score += (this.getSubPct('premium') / 100) * 30;

    // Has hotels → 15 pts
    if ((this.data.hotels || 0) > 0) score += 15;

    // Has enough users → 15 pts
    if ((this.data.users || 0) >= 10) score += 15;

    return Math.round(Math.min(score, 100));
  }

  get healthGrade(): string {
    const s = this.healthScore;
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Needs attention';
  }

  /** stroke-dasharray for health ring (r=50, circ≈314.2) */
  get healthDash(): string {
    const fill = (this.healthScore / 100) * this.HEALTH_CIRC;
    return `${fill} ${this.HEALTH_CIRC - fill}`;
  }
}