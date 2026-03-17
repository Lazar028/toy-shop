import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem, Gender, OrderStatus } from '../../models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container section">
      <div class="cart-header">
        <h2>Moja korpa</h2>
        <span class="cart-count badge badge-primary">{{ items().length }} stavki</span>
      </div>

      @if (items().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Korpa je prazna</h3>
          <p>Dodajte igračke iz kataloga</p>
          <a routerLink="/toys" class="btn btn-primary mt-16">Pregledaj igračke</a>
        </div>
      } @else {
        <div class="cart-layout">
          <!-- Items list -->
          <div class="cart-items">
            @for (item of items(); track item.cartItemId) {
              <div class="cart-item" [class.item-arrived]="item.status === 'pristiglo'" [class.item-cancelled]="item.status === 'otkazano'">
                <div class="item-img">
                  <span class="item-emoji">{{ getEmoji(item.toy.type?.name) }}</span>
                </div>

                <div class="item-body">
                  <div class="item-top">
                    <a [routerLink]="['/toys', item.toy.permalink]" class="item-name">{{ item.toy.name }}</a>
                    <span class="badge" [ngClass]="'status-' + item.status">{{ item.status }}</span>
                  </div>

                  <div class="item-meta">
                    @if (item.toy.type) { <span class="badge badge-primary">{{ item.toy.type.name }}</span> }
                    @if (item.toy.ageGroup) { <span class="badge badge-accent">{{ item.toy.ageGroup.name }}</span> }
                    <span class="badge badge-gray">{{ item.gender }}</span>
                  </div>

                  <!-- Edit form (only 'rezervisano') -->
                  @if (item.status === 'rezervisano' && editingId() === item.cartItemId) {
                    <div class="edit-form">
                      <div class="form-group">
                        <label>Ciljna grupa</label>
                        <select class="form-control" [(ngModel)]="editGender">
                          <option value="devojčica">Devojčica</option>
                          <option value="dečak">Dečak</option>
                          <option value="svi">Svi</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Status</label>
                        <select class="form-control" [(ngModel)]="editStatus">
                          <option value="rezervisano">Rezervisano</option>
                          <option value="pristiglo">Pristiglo</option>
                          <option value="otkazano">Otkazano</option>
                        </select>
                      </div>
                      <div class="edit-actions">
                        <button class="btn btn-primary btn-sm" (click)="saveEdit(item)">Sačuvaj</button>
                        <button class="btn btn-ghost btn-sm" (click)="editingId.set(null)">Otkaži</button>
                      </div>
                    </div>
                  }

                  <!-- Rating (only 'pristiglo') -->
                  @if (item.status === 'pristiglo') {
                    <div class="rating-row">
                      <span class="rating-label">Vaša ocena:</span>
                      <div class="rating-stars">
                        @for (s of [1,2,3,4,5]; track s) {
                          <button class="star-btn" [class.filled]="(item.rating ?? 0) >= s"
                            (click)="rateItem(item, s)" title="{{ s }} zvezda">★</button>
                        }
                      </div>
                      @if (item.rating) {
                        <span class="rating-saved">✓ Ocenjeno</span>
                      }
                    </div>
                  }
                </div>

                <div class="item-right">
                  <span class="item-price">{{ item.toy.price | currency:'RSD':'symbol':'1.0-0':'sr' }}</span>
                  <div class="item-actions">
                    @if (item.status === 'rezervisano') {
                      <button class="btn btn-ghost btn-sm" (click)="startEdit(item)" title="Izmeni">
                        ✏️
                      </button>
                      <button class="btn btn-ghost btn-sm" (click)="cancel(item)" title="Otkaži rezervaciju">
                        ✕
                      </button>
                    }
                    @if (item.status === 'pristiglo') {
                      <button class="btn btn-danger btn-sm" (click)="remove(item)" title="Ukloni">
                        🗑
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="cart-summary">
            <h3>Pregled narudžbine</h3>
            <div class="summary-rows">
              <div class="summary-row">
                <span>Stavke ({{ activeCount }})</span>
                <span>{{ activeTotal | currency:'RSD':'symbol':'1.0-0':'sr' }}</span>
              </div>
              @if (cancelledCount > 0) {
                <div class="summary-row muted">
                  <span>Otkazano ({{ cancelledCount }})</span>
                  <span>—</span>
                </div>
              }
              <div class="divider"></div>
              <div class="summary-row total">
                <span>Ukupno</span>
                <span>{{ activeTotal | currency:'RSD':'symbol':'1.0-0':'sr' }}</span>
              </div>
            </div>

            <div class="status-legend">
              <h4>Legenda statusa</h4>
              <div class="legend-item">
                <span class="badge status-rezervisano">rezervisano</span>
                <span>Igračka je rezervisana</span>
              </div>
              <div class="legend-item">
                <span class="badge status-pristiglo">pristiglo</span>
                <span>Igračka je stigla, može se oceniti</span>
              </div>
              <div class="legend-item">
                <span class="badge status-otkazano">otkazano</span>
                <span>Rezervacija otkazana</span>
              </div>
            </div>

            <a routerLink="/toys" class="btn btn-outline" style="width:100%; justify-content:center; margin-top:16px">
              + Dodaj još igračaka
            </a>
          </div>
        </div>
      }
    </div>

    @if (toast()) {
      <div class="toast" [class.success]="toastType() === 'success'" [class.error]="toastType() === 'error'">
        {{ toast() }}
      </div>
    }
  `,
  styles: [`
    .cart-header { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
    .cart-count { font-size: 14px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }

    .cart-item {
      display: flex; gap: 16px; align-items: flex-start;
      background: var(--warm-white); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px;
      transition: box-shadow .2s;
    }
    .cart-item:hover { box-shadow: var(--shadow-sm); }
    .item-arrived { border-color: #A8D5B5; }
    .item-cancelled { opacity: .6; }

    .item-img {
      width: 80px; height: 80px; flex-shrink: 0;
      background: var(--primary-pale); border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem;
    }
    .item-emoji { display: block; }
    .item-body { flex: 1; min-width: 0; }
    .item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .item-name { font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--ink); text-decoration: none; }
    .item-name:hover { color: var(--primary); }
    .item-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
    .item-price { font-family: var(--font-display); font-weight: 700; color: var(--primary); font-size: 1.1rem; white-space: nowrap; }
    .item-actions { display: flex; gap: 4px; }

    .edit-form { background: var(--cream); border-radius: var(--radius-md); padding: 14px; margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
    .edit-actions { display: flex; gap: 8px; }

    .rating-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .rating-label { font-size: 13px; font-weight: 600; color: var(--ink-soft); }
    .rating-stars { display: flex; gap: 2px; }
    .star-btn { background: none; border: none; cursor: pointer; font-size: 22px; color: #DDD; padding: 0; transition: color .1s, transform .1s; line-height: 1; }
    .star-btn:hover, .star-btn.filled { color: var(--yellow); }
    .star-btn:hover { transform: scale(1.2); }
    .rating-saved { font-size: 12px; font-weight: 600; color: var(--green); }

    .cart-summary {
      background: var(--warm-white); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px;
      position: sticky; top: calc(var(--nav-h) + 24px);
    }
    .cart-summary h3 { font-family: var(--font-display); margin-bottom: 20px; }
    .summary-rows { display: flex; flex-direction: column; gap: 10px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 15px; }
    .summary-row.muted { color: var(--ink-muted); }
    .summary-row.total { font-weight: 700; font-size: 1.1rem; }

    .status-legend { margin-top: 20px; padding-top: 16px; border-top: 1.5px solid var(--border); }
    .status-legend h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-muted); margin-bottom: 12px; }
    .legend-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; color: var(--ink-soft); }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-summary { position: static; }
    }
    @media (max-width: 560px) {
      .cart-item { flex-wrap: wrap; }
      .item-right { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
    }
  `]
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  auth = inject(AuthService);

  items = this.cartService.items;
  editingId = signal<string | null>(null);
  editGender: Gender = 'svi';
  editStatus: OrderStatus = 'rezervisano';

  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  get activeCount(): number {
    return this.items().filter(i => i.status !== 'otkazano').length;
  }
  get activeTotal(): number {
    return this.items().filter(i => i.status !== 'otkazano').reduce((s, i) => s + i.toy.price, 0);
  }
  get cancelledCount(): number {
    return this.items().filter(i => i.status === 'otkazano').length;
  }

  ngOnInit(): void {
    this.cartService.loadUserCart();
  }

  getEmoji(type?: string): string {
    const map: Record<string, string> = {
      'puzzle': '🧩', 'slagalica': '🧩', 'slikovnica': '📚',
      'figura': '🦸', 'karakter': '🧸', 'vozilo': '🚗',
      'sport': '⚽', 'kreativnost': '🎨', 'muzika': '🎵',
      'nauka': '🔬', 'lego': '🧱',
    };
    const lower = type?.toLowerCase() ?? '';
    for (const [key, emoji] of Object.entries(map)) {
      if (lower.includes(key)) return emoji;
    }
    return '🪀';
  }

  startEdit(item: CartItem): void {
    this.editingId.set(item.cartItemId);
    this.editGender = item.gender;
    this.editStatus = item.status;
  }

  saveEdit(item: CartItem): void {
    this.cartService.updateItem(item.cartItemId, { gender: this.editGender, status: this.editStatus });
    this.editingId.set(null);
    this.showToast('Izmene sačuvane ✓', 'success');
  }

  cancel(item: CartItem): void {
    if (confirm(`Otkazati rezervaciju za "${item.toy.name}"?`)) {
      this.cartService.cancelReservation(item.cartItemId);
      this.showToast('Rezervacija otkazana', 'error');
    }
  }

  remove(item: CartItem): void {
    if (confirm(`Ukloniti "${item.toy.name}" iz korpe?`)) {
      this.cartService.removeFromCart(item.cartItemId);
      this.showToast('Igračka uklonjena iz korpe', 'success');
    }
  }

  rateItem(item: CartItem, rating: number): void {
    this.cartService.rateItem(item.cartItemId, rating);
    this.showToast(`Ocenili ste "${item.toy.name}" sa ${rating} ★`, 'success');
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
