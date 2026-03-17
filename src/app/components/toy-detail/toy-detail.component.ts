import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToyService } from '../../services/toy.service';
import { CartService, ReviewEntry } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Toy, Gender } from '../../models/models';
import { FormsModule } from '@angular/forms';
import { ToyCardComponent } from '../toy-list/toy-card.component';

@Component({
  selector: 'app-toy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    @if (loading) {
      <div class="spinner" style="margin-top:80px"></div>
    }

    @if (toy) {
      <div class="container section">
        <a routerLink="/toys" class="back-link">← Nazad na listu</a>

        <div class="detail-grid">
          <!-- Image -->
          <div class="detail-img-wrap">
            <div class="detail-img">
              <span class="detail-emoji">{{ getEmoji(toy.type?.name) }}</span>
            </div>
            <div class="detail-img-badges">
              @if (toy.type) { <span class="badge badge-primary">{{ toy.type.name }}</span> }
              @if (toy.ageGroup) { <span class="badge badge-accent">{{ toy.ageGroup.name }}</span> }
            </div>
          </div>

          <!-- Info -->
          <div class="detail-info">
            <h1 class="detail-title">{{ toy.name }}</h1>

            <div class="detail-rating">
              @for (s of stars(avgRating); track $index) {
                <span class="star" [class.filled]="s === 1">★</span>
              }
              <span class="text-muted" style="font-size:14px; margin-left:6px">{{ reviews.length }} recenzija</span>
            </div>

            <p class="detail-price">{{ toy.price | currency:'RSD':'symbol':'1.0-0':'sr' }}</p>
            <p class="detail-desc">{{ toy.description }}</p>

            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">Datum proizvodnje</span>
                <span class="meta-val">{{ toy.createdAt | date:'dd.MM.yyyy' }}</span>
              </div>
              @if (toy.type) {
                <div class="meta-item">
                  <span class="meta-label">Tip</span>
                  <span class="meta-val">{{ toy.type.name }}</span>
                </div>
              }
              @if (toy.ageGroup) {
                <div class="meta-item">
                  <span class="meta-label">Uzrast</span>
                  <span class="meta-val">{{ toy.ageGroup.name }}</span>
                </div>
              }
            </div>

            @if (auth.isLoggedIn()) {
              @if (!inCart) {
                <div class="reserve-form">
                  <div class="form-group">
                    <label>Ciljna grupa</label>
                    <select class="form-control" [(ngModel)]="selectedGender">
                      <option value="devojčica">Devojčica</option>
                      <option value="dečak">Dečak</option>
                      <option value="svi">Svi</option>
                    </select>
                  </div>
                  <button class="btn btn-primary btn-lg" style="margin-top:8px" (click)="addToCart()">
                    🛒 Dodaj u korpu
                  </button>
                </div>
              } @else {
                <div class="in-cart-notice">
                  <span>✓ Igračka je u vašoj korpi</span>
                  <a routerLink="/cart" class="btn btn-outline btn-sm">Pogledaj korpu</a>
                </div>
              }
            } @else {
              <a routerLink="/auth" class="btn btn-primary btn-lg">Prijavi se da rezervišeš</a>
            }

            @if (toastMsg) {
              <div class="inline-toast">{{ toastMsg }}</div>
            }
          </div>
        </div>

        <!-- Reviews -->
        <div class="reviews-section">
          <h2 class="reviews-title">Recenzije korisnika</h2>
          @if (reviews.length === 0) {
            <p class="text-muted">Još nema recenzija za ovu igračku.</p>
          }
          <div class="reviews-list">
            @for (r of reviews; track r.reviewId) {
              <div class="review-card">
                <div class="review-header">
                  <div class="review-avatar">{{ r.author.charAt(0) }}</div>
                  <div>
                    <strong>{{ r.author }}</strong>
                    <div class="review-stars">
                      @for (s of stars(r.rating); track $index) {
                        <span class="star" [class.filled]="s===1">★</span>
                      }
                    </div>
                  </div>
                  <span class="review-date text-muted">{{ r.createdAt | date:'dd.MM.yyyy' }}</span>
                </div>
                @if (r.comment) {
                  <p class="review-comment">{{ r.comment }}</p>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--ink-muted); margin-bottom: 32px; text-decoration: none; }
    .back-link:hover { color: var(--primary); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; margin-bottom: 64px; }
    .detail-img-wrap { position: sticky; top: calc(var(--nav-h) + 24px); align-self: start; }
    .detail-img {
      border-radius: var(--radius-xl); background: var(--primary-pale);
      display: flex; align-items: center; justify-content: center;
      height: 360px; margin-bottom: 16px;
    }
    .detail-emoji { font-size: 8rem; }
    .detail-img-badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .detail-title { font-family: var(--font-display); font-size: 2rem; margin-bottom: 12px; }
    .detail-rating { display: flex; align-items: center; gap: 2px; margin-bottom: 16px; }
    .star { font-size: 18px; color: #DDD; }
    .star.filled { color: var(--yellow); }
    .detail-price { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 20px; }
    .detail-desc { font-size: 1rem; color: var(--ink-soft); line-height: 1.7; margin-bottom: 28px; }
    .detail-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
    .meta-item { background: var(--warm-white); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 12px 16px; }
    .meta-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-muted); margin-bottom: 4px; }
    .meta-val { font-weight: 600; color: var(--ink); }
    .reserve-form { display: flex; flex-direction: column; gap: 12px; }
    .in-cart-notice { display: flex; align-items: center; justify-content: space-between; background: var(--green-pale); border: 1.5px solid var(--green); border-radius: var(--radius-md); padding: 14px 18px; font-weight: 600; color: var(--green); }
    .inline-toast { margin-top: 12px; padding: 12px 16px; background: var(--green-pale); color: var(--green); border-radius: var(--radius-md); font-weight: 600; font-size: 14px; }
    .reviews-section { border-top: 1.5px solid var(--border); padding-top: 40px; }
    .reviews-title { font-family: var(--font-display); margin-bottom: 24px; }
    .reviews-list { display: flex; flex-direction: column; gap: 16px; }
    .review-card { background: var(--warm-white); border: 1.5px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
    .review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .review-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary-pale); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .review-stars { display: flex; gap: 2px; }
    .review-date { margin-left: auto; font-size: 13px; }
    .review-comment { color: var(--ink-soft); line-height: 1.6; }
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .detail-img-wrap { position: static; }
      .detail-img { height: 240px; }
      .detail-emoji { font-size: 5rem; }
    }
  `]
})
export class ToyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toyService = inject(ToyService);
  cartService = inject(CartService);
  auth = inject(AuthService);

  toy: Toy | null = null;
  reviews: ReviewEntry[] = [];
  avgRating = 0;
  loading = true;
  inCart = false;
  selectedGender: Gender = 'svi';
  toastMsg = '';

  ngOnInit(): void {
    const permalink = this.route.snapshot.paramMap.get('permalink')!;
    this.toyService.getToyByPermalink(permalink).subscribe({
      next: toy => {
        this.toy = toy;
        this.reviews = this.cartService.getReviewsForToy(toy.toyId);
        this.avgRating = this.cartService.avgRating(toy.toyId);
        this.inCart = this.cartService.isInCart(toy.toyId);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getEmoji(type?: string): string {
    const map: Record<string, string> = {
      'puzzle': '🧩', 'slagalica': '🧩', 'slikovnica': '📚',
      'figura': '🦸', 'karakter': '🧸', 'vozilo': '🚗', 'sport': '⚽',
      'kreativnost': '🎨', 'muzika': '🎵', 'nauka': '🔬', 'lego': '🧱',
    };
    const lower = type?.toLowerCase() ?? '';
    for (const [key, emoji] of Object.entries(map)) {
      if (lower.includes(key)) return emoji;
    }
    return '🪀';
  }

  stars(avg: number): number[] {
    return [1, 2, 3, 4, 5].map(i => (i <= Math.round(avg) ? 1 : 0));
  }

  addToCart(): void {
    if (!this.toy) return;
    const ok = this.cartService.addToCart(this.toy, this.selectedGender);
    if (ok) {
      this.inCart = true;
      this.toastMsg = `"${this.toy.name}" dodata u korpu! 🛒`;
      setTimeout(() => this.toastMsg = '', 3000);
    }
  }
}
