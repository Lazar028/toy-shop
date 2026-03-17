import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Toy, Gender, OrderStatus } from '../models/models';
import { AuthService } from './auth.service';

const REVIEWS_KEY = 'toy_shop_reviews';

export interface ReviewEntry {
  reviewId: string;
  toyId: number;
  userId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  items = this._items.asReadonly();
  totalPrice = computed(() => this._items().reduce((sum, i) => sum + i.toy.price, 0));
  count = computed(() => this._items().length);

  constructor(private auth: AuthService) {
    // Load cart from user profile on init
    const user = this.auth.currentUser();
    if (user) this._items.set(user.cart || []);

    // React to login/logout
    // In a real app: effect(() => { ... })
  }

  loadUserCart(): void {
    const user = this.auth.currentUser();
    this._items.set(user?.cart || []);
  }

  addToCart(toy: Toy, gender: Gender = 'svi'): boolean {
    const existing = this._items().find(i => i.toy.toyId === toy.toyId);
    if (existing) return false;
    const item: CartItem = {
      cartItemId: crypto.randomUUID(),
      toy,
      status: 'rezervisano',
      gender,
      addedAt: new Date().toISOString()
    };
    const updated = [...this._items(), item];
    this._items.set(updated);
    this.persist();
    return true;
  }

  removeFromCart(cartItemId: string): void {
    const item = this._items().find(i => i.cartItemId === cartItemId);
    if (!item) return;
    // Can only delete 'pristiglo' items
    if (item.status !== 'pristiglo') return;
    this._items.set(this._items().filter(i => i.cartItemId !== cartItemId));
    this.persist();
  }

  cancelReservation(cartItemId: string): void {
    const updated = this._items().map(i =>
      i.cartItemId === cartItemId && i.status === 'rezervisano'
        ? { ...i, status: 'otkazano' as OrderStatus }
        : i
    );
    this._items.set(updated);
    this.persist();
  }

  updateItem(cartItemId: string, changes: Partial<Pick<CartItem, 'gender' | 'status'>>): void {
    const updated = this._items().map(i =>
      i.cartItemId === cartItemId && i.status === 'rezervisano'
        ? { ...i, ...changes }
        : i
    );
    this._items.set(updated);
    this.persist();
  }

  rateItem(cartItemId: string, rating: number): void {
    const updated = this._items().map(i =>
      i.cartItemId === cartItemId && i.status === 'pristiglo'
        ? { ...i, rating }
        : i
    );
    this._items.set(updated);
    this.persist();
    // Also save as public review
    const item = this._items().find(i => i.cartItemId === cartItemId);
    const user = this.auth.currentUser();
    if (item && user) {
      this.saveReview({
        reviewId: crypto.randomUUID(),
        toyId: item.toy.toyId,
        userId: user.userId,
        author: `${user.firstName} ${user.lastName}`,
        rating,
        comment: '',
        createdAt: new Date().toISOString()
      });
    }
  }

  isInCart(toyId: number): boolean {
    return this._items().some(i => i.toy.toyId === toyId);
  }

  private persist(): void {
    const user = this.auth.currentUser();
    if (user) this.auth.saveCart(user.userId, this._items());
  }

  // ── Reviews ──────────────────────────────────────────────────────────────

  getReviews(): ReviewEntry[] {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  getReviewsForToy(toyId: number): ReviewEntry[] {
    return this.getReviews().filter(r => r.toyId === toyId);
  }

  private saveReview(review: ReviewEntry): void {
    const reviews = this.getReviews().filter(
      r => !(r.toyId === review.toyId && r.userId === review.userId)
    );
    reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }

  avgRating(toyId: number): number {
    const reviews = this.getReviewsForToy(toyId);
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }
}
