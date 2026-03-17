import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { UserProfile } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container section">
      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <div class="profile-avatar">
            <span class="avatar-initials">{{ initials() }}</span>
          </div>
          <h3 class="profile-name">{{ user()?.firstName }} {{ user()?.lastName }}</h3>
          <p class="profile-email">{{ user()?.email }}</p>

          <nav class="profile-nav">
            <button class="profile-nav-btn" [class.active]="tab() === 'info'" (click)="tab.set('info')">
              👤 Lični podaci
            </button>
            <button class="profile-nav-btn" [class.active]="tab() === 'orders'" (click)="tab.set('orders')">
              📦 Moje rezervacije
              @if (orderCount > 0) {
                <span class="nav-badge">{{ orderCount }}</span>
              }
            </button>
            <button class="profile-nav-btn" [class.active]="tab() === 'password'" (click)="tab.set('password')">
              🔑 Promena lozinke
            </button>
          </nav>

          <button class="btn btn-ghost" style="width:100%; margin-top:16px" (click)="logout()">
            Odjava
          </button>
        </aside>

        <!-- Main content -->
        <div class="profile-main">
          @if (successMsg()) {
            <div class="auth-success">✓ {{ successMsg() }}</div>
          }
          @if (errorMsg()) {
            <div class="auth-error">⚠ {{ errorMsg() }}</div>
          }

          <!-- Personal info tab -->
          @if (tab() === 'info') {
            <div class="profile-section">
              <h2 class="section-title">Lični podaci</h2>
              <form (ngSubmit)="saveProfile()" class="profile-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Ime</label>
                    <input class="form-control" type="text" [(ngModel)]="form.firstName" name="firstName" required>
                  </div>
                  <div class="form-group">
                    <label>Prezime</label>
                    <input class="form-control" type="text" [(ngModel)]="form.lastName" name="lastName" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Email adresa</label>
                  <input class="form-control" type="email" [(ngModel)]="form.email" name="email" required>
                </div>
                <div class="form-group">
                  <label>Broj telefona</label>
                  <input class="form-control" type="tel" [(ngModel)]="form.phone" name="phone">
                </div>
                <div class="form-group">
                  <label>Adresa dostave</label>
                  <input class="form-control" type="text" [(ngModel)]="form.address" name="address">
                </div>
                <div class="form-group">
                  <label>Omiljeni tipovi igračaka</label>
                  <input class="form-control" type="text" [(ngModel)]="form.favoriteToyTypes" name="favToys"
                    placeholder="npr. slagalica, figura, slikovnica">
                  <small style="font-size:12px; color:var(--ink-muted)">Razdvojite zarezom</small>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary">Sačuvaj izmene</button>
                  <button type="button" class="btn btn-ghost" (click)="loadForm()">Poništi</button>
                </div>
              </form>
            </div>
          }

          <!-- Orders tab -->
          @if (tab() === 'orders') {
            <div class="profile-section">
              <div class="section-header-row">
                <h2 class="section-title">Moje rezervacije</h2>
                <a routerLink="/cart" class="btn btn-outline btn-sm">Otvori korpu →</a>
              </div>

              @if (cartItems().length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">📦</div>
                  <h3>Nema rezervacija</h3>
                  <a routerLink="/toys" class="btn btn-outline mt-16">Pretraži igračke</a>
                </div>
              } @else {
                <div class="orders-list">
                  @for (item of cartItems(); track item.cartItemId) {
                    <div class="order-item">
                      <div class="order-emoji">{{ getEmoji(item.toy.type?.name) }}</div>
                      <div class="order-info">
                        <a [routerLink]="['/toys', item.toy.permalink]" class="order-name">{{ item.toy.name }}</a>
                        <div class="order-meta">
                          <span class="badge" [ngClass]="'status-' + item.status">{{ item.status }}</span>
                          @if (item.toy.ageGroup) { <span class="badge badge-accent">{{ item.toy.ageGroup.name }}</span> }
                          <span class="badge badge-gray">{{ item.gender }}</span>
                        </div>
                        @if (item.status === 'pristiglo' && item.rating) {
                          <div class="order-rating">
                            @for (s of stars(item.rating); track $index) {
                              <span class="star" [class.filled]="s===1">★</span>
                            }
                          </div>
                        }
                      </div>
                      <div class="order-price">{{ item.toy.price | currency:'RSD':'symbol':'1.0-0':'sr' }}</div>
                    </div>
                  }
                </div>

                <div class="orders-total">
                  <span>Ukupno aktivnih:</span>
                  <strong>{{ activeTotal | currency:'RSD':'symbol':'1.0-0':'sr' }}</strong>
                </div>
              }
            </div>
          }

          <!-- Password tab -->
          @if (tab() === 'password') {
            <div class="profile-section">
              <h2 class="section-title">Promena lozinke</h2>
              <form (ngSubmit)="changePassword()" class="profile-form" style="max-width:400px">
                <div class="form-group">
                  <label>Trenutna lozinka</label>
                  <input class="form-control" type="password" [(ngModel)]="pwdForm.current" name="current" required>
                </div>
                <div class="form-group">
                  <label>Nova lozinka</label>
                  <input class="form-control" type="password" [(ngModel)]="pwdForm.newPwd" name="newPwd" required minlength="6">
                </div>
                <div class="form-group">
                  <label>Potvrda nove lozinke</label>
                  <input class="form-control" type="password" [(ngModel)]="pwdForm.confirm" name="confirm" required>
                </div>
                <button type="submit" class="btn btn-primary">Promeni lozinku</button>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; align-items: start; }

    .profile-sidebar {
      background: var(--warm-white); border: 1.5px solid var(--border);
      border-radius: var(--radius-xl); padding: 28px 20px;
      position: sticky; top: calc(var(--nav-h) + 24px); text-align: center;
    }
    .profile-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--primary-pale); margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .avatar-initials { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: var(--primary); }
    .profile-name { font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px; }
    .profile-email { font-size: 13px; color: var(--ink-muted); margin-bottom: 24px; word-break: break-all; }

    .profile-nav { display: flex; flex-direction: column; gap: 4px; text-align: left; }
    .profile-nav-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: var(--radius-md);
      background: none; border: none; cursor: pointer;
      font-family: var(--font-body); font-size: 14px; font-weight: 500;
      color: var(--ink-soft); transition: all .2s; width: 100%;
    }
    .profile-nav-btn:hover { background: var(--primary-pale); color: var(--primary); }
    .profile-nav-btn.active { background: var(--primary-pale); color: var(--primary); font-weight: 600; }
    .nav-badge {
      margin-left: auto; background: var(--primary); color: #fff;
      width: 18px; height: 18px; border-radius: 50%;
      font-size: 11px; display: flex; align-items: center; justify-content: center;
    }

    .profile-main { min-width: 0; }
    .profile-section { background: var(--warm-white); border: 1.5px solid var(--border); border-radius: var(--radius-xl); padding: 32px; }
    .section-title { font-family: var(--font-display); margin-bottom: 28px; }
    .section-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .section-header-row .section-title { margin-bottom: 0; }

    .profile-form { display: flex; flex-direction: column; gap: 18px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }

    .auth-error { background: #FDECEA; border: 1.5px solid #F5C6C6; color: #C0392B; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }
    .auth-success { background: var(--green-pale); border: 1.5px solid #A8D5B5; color: var(--green); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }

    .orders-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .order-item {
      display: flex; align-items: center; gap: 14px;
      padding: 14px; border: 1.5px solid var(--border);
      border-radius: var(--radius-md); background: var(--cream);
    }
    .order-emoji { font-size: 2rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--primary-pale); border-radius: var(--radius-sm); flex-shrink: 0; }
    .order-info { flex: 1; min-width: 0; }
    .order-name { font-weight: 600; color: var(--ink); text-decoration: none; font-size: 15px; }
    .order-name:hover { color: var(--primary); }
    .order-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .order-rating { display: flex; gap: 2px; margin-top: 4px; }
    .star { font-size: 14px; color: #DDD; }
    .star.filled { color: var(--yellow); }
    .order-price { font-family: var(--font-display); font-weight: 700; color: var(--primary); font-size: 1rem; white-space: nowrap; }

    .orders-total { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--primary-pale); border-radius: var(--radius-md); font-size: 15px; }
    .orders-total strong { font-family: var(--font-display); font-size: 1.2rem; color: var(--primary); }

    @media (max-width: 900px) {
      .profile-layout { grid-template-columns: 1fr; }
      .profile-sidebar { position: static; text-align: left; }
      .profile-avatar { margin: 0 0 16px; }
    }
    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; }
      .profile-section { padding: 20px; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  user = this.authService.currentUser;
  cartItems = this.cartService.items;
  tab = signal<'info' | 'orders' | 'password'>('info');
  successMsg = signal('');
  errorMsg = signal('');

  form = { firstName: '', lastName: '', email: '', phone: '', address: '', favoriteToyTypes: '' };
  pwdForm = { current: '', newPwd: '', confirm: '' };

  get initials(): () => string {
    return () => {
      const u = this.user();
      if (!u) return '';
      return (u.firstName.charAt(0) + u.lastName.charAt(0)).toUpperCase();
    };
  }

  get orderCount(): number { return this.cartItems().length; }

  get activeTotal(): number {
    return this.cartItems()
      .filter(i => i.status !== 'otkazano')
      .reduce((s, i) => s + i.toy.price, 0);
  }

  ngOnInit(): void {
    this.cartService.loadUserCart();
    this.loadForm();
  }

  loadForm(): void {
    const u = this.user();
    if (!u) return;
    this.form = {
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      address: u.address,
      favoriteToyTypes: (u.favoriteToyTypes || []).join(', ')
    };
  }

  saveProfile(): void {
    this.errorMsg.set('');
    const u = this.user();
    if (!u) return;
    const updated: UserProfile = {
      ...u,
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phone: this.form.phone,
      address: this.form.address,
      favoriteToyTypes: this.form.favoriteToyTypes.split(',').map(s => s.trim()).filter(Boolean)
    };
    this.authService.updateProfile(updated);
    this.successMsg.set('Podaci profila uspešno sačuvani.');
    setTimeout(() => this.successMsg.set(''), 3000);
  }

  changePassword(): void {
    this.errorMsg.set(''); this.successMsg.set('');
    const u = this.user();
    if (!u) return;
    if (u.password !== btoa(this.pwdForm.current)) {
      this.errorMsg.set('Trenutna lozinka nije ispravna.'); return;
    }
    if (this.pwdForm.newPwd.length < 6) {
      this.errorMsg.set('Nova lozinka mora imati najmanje 6 znakova.'); return;
    }
    if (this.pwdForm.newPwd !== this.pwdForm.confirm) {
      this.errorMsg.set('Nova lozinka i potvrda se ne poklapaju.'); return;
    }
    this.authService.updateProfile({ ...u, password: btoa(this.pwdForm.newPwd) });
    this.pwdForm = { current: '', newPwd: '', confirm: '' };
    this.successMsg.set('Lozinka uspešno promenjena.');
    setTimeout(() => this.successMsg.set(''), 3000);
  }

  logout(): void {
    this.authService.logout();
    this.cartService.loadUserCart();
    this.router.navigate(['/']);
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

  stars(rating: number): number[] {
    return [1,2,3,4,5].map(i => i <= rating ? 1 : 0);
  }
}
