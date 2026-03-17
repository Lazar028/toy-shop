import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toy } from '../../models/models';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-toy-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="toy-card card">
      <a [routerLink]="['/toys', toy.permalink]" class="card-img-link">
        <div class="card-img">
          <span class="toy-emoji">{{ getEmoji(toy.type?.name) }}</span>
        </div>
      </a>
      <div class="card-body">
        <div class="card-tags">
          @if (toy.type) {
            <span class="badge badge-primary">{{ toy.type.name }}</span>
          }
          @if (toy.ageGroup) {
            <span class="badge badge-accent">{{ toy.ageGroup.name }}</span>
          }
        </div>
        <a [routerLink]="['/toys', toy.permalink]">
          <h3 class="toy-name">{{ toy.name }}</h3>
        </a>
        <p class="toy-desc">{{ toy.description | slice:0:80 }}{{ toy.description.length > 80 ? '…' : '' }}</p>
        <div class="stars-row">
          @for (s of stars(avgRating()); track $index) {
            <span class="star" [class.filled]="s === 1">★</span>
          }
          <span class="review-count text-muted">({{ reviewCount() }})</span>
        </div>
        <div class="card-footer">
          <span class="price">{{ toy.price | currency:'RSD':'symbol':'1.0-0':'sr' }}</span>
          @if (auth.isLoggedIn()) {
            @if (inCart()) {
              <button class="btn btn-ghost btn-sm" disabled>✓ Rezervisano</button>
            } @else {
              <button class="btn btn-primary btn-sm" (click)="addToCart($event)">+ Rezerviši</button>
            }
          } @else {
            <a routerLink="/auth" class="btn btn-outline btn-sm">Prijavi se</a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toy-card { cursor: default; height: 100%; display: flex; flex-direction: column; }
    .card-img-link { text-decoration: none; display: block; }
    .card-img {
      height: 160px; background: var(--primary-pale);
      display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }
    .toy-card:hover .card-img { background: #F5D5C8; }
    .toy-emoji { font-size: 5rem; }
    .card-body { display: flex; flex-direction: column; flex: 1; padding: 16px; }
    .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .toy-name {
      font-family: var(--font-display); font-size: 1.05rem;
      color: var(--ink); margin-bottom: 6px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .toy-name:hover { color: var(--primary); }
    .toy-desc { font-size: 13px; color: var(--ink-muted); flex: 1; margin-bottom: 8px; line-height: 1.5; }
    .stars-row { display: flex; align-items: center; gap: 2px; margin-bottom: 12px; }
    .star { font-size: 14px; color: #DDD; }
    .star.filled { color: var(--yellow); }
    .review-count { font-size: 12px; margin-left: 4px; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
    .price { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--primary); }
  `]
})
export class ToyCardComponent {
  @Input() toy!: Toy;
  cart = inject(CartService);
  auth = inject(AuthService);
  private toast?: HTMLElement;

  getEmoji(type?: string): string {
    const map: Record<string, string> = {
      'puzzle': '🧩', 'slagalica': '🧩',
      'slikovnica': '📚', 'book': '📚',
      'figura': '🦸', 'figure': '🦸',
      'karakter': '🧸', 'plush': '🧸',
      'vozilo': '🚗', 'vehicle': '🚗',
      'sport': '⚽', 'ball': '⚽',
      'kreativnost': '🎨', 'art': '🎨',
      'muzika': '🎵', 'music': '🎵',
      'nauka': '🔬', 'science': '🔬',
      'lego': '🧱', 'blocks': '🧱',
    };
    const lower = type?.toLowerCase() ?? '';
    for (const [key, emoji] of Object.entries(map)) {
      if (lower.includes(key)) return emoji;
    }
    return '🪀';
  }

  avgRating(): number {
    return this.cart.avgRating(this.toy.toyId);
  }

  reviewCount(): number {
    return this.cart.getReviewsForToy(this.toy.toyId).length;
  }

  stars(avg: number): number[] {
    return [1, 2, 3, 4, 5].map(i => (i <= Math.round(avg) ? 1 : 0));
  }

  inCart(): boolean {
    return this.cart.isInCart(this.toy.toyId);
  }

  addToCart(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.cart.addToCart(this.toy);
    this.showToast(`"${this.toy.name}" dodata u korpu! 🛒`);
  }

  private showToast(msg: string): void {
    const t = document.createElement('div');
    t.className = 'toast success';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
}
