import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">🧸</span>
          <span class="brand-text">Pequla<em>Toys</em></span>
        </a>

        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Početna</a>
          <a routerLink="/toys" routerLinkActive="active">Igračke</a>
        </div>

        <div class="nav-actions">
          @if (auth.isLoggedIn()) {
            <a routerLink="/cart" class="cart-btn" [class.has-items]="cartCount() > 0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Korpa
              @if (cartCount() > 0) {
                <span class="cart-badge">{{ cartCount() }}</span>
              }
            </a>
            <a routerLink="/profile" class="btn btn-ghost btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {{ firstName() }}
            </a>
            <button class="btn btn-ghost btn-sm" (click)="logout()">Odjava</button>
          } @else {
            <a routerLink="/auth" class="btn btn-outline btn-sm">Prijava</a>
            <a routerLink="/auth" [queryParams]="{mode:'register'}" class="btn btn-primary btn-sm">Registracija</a>
          }
        </div>

        <button class="menu-toggle" (click)="menuOpen = !menuOpen" [class.open]="menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (menuOpen) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="menuOpen=false">Početna</a>
          <a routerLink="/toys" (click)="menuOpen=false">Igračke</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/cart" (click)="menuOpen=false">Korpa ({{ cartCount() }})</a>
            <a routerLink="/profile" (click)="menuOpen=false">Profil</a>
            <button (click)="logout(); menuOpen=false">Odjava</button>
          } @else {
            <a routerLink="/auth" (click)="menuOpen=false">Prijava / Registracija</a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(253,248,240,.95); backdrop-filter: blur(12px);
      border-bottom: 1.5px solid var(--border);
      height: var(--nav-h);
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      height: 100%; display: flex; align-items: center; gap: 32px;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
      color: var(--ink); text-decoration: none; white-space: nowrap;
    }
    .nav-brand em { color: var(--primary); font-style: italic; }
    .brand-icon { font-size: 1.4rem; }
    .nav-links { display: flex; gap: 4px; }
    .nav-links a {
      padding: 6px 14px; border-radius: var(--radius-sm);
      font-size: 15px; font-weight: 500; color: var(--ink-soft);
      text-decoration: none; transition: all .2s;
    }
    .nav-links a:hover, .nav-links a.active {
      background: var(--primary-pale); color: var(--primary);
    }
    .nav-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .cart-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: var(--radius-md);
      background: var(--primary-pale); color: var(--primary);
      font-size: 14px; font-weight: 600; text-decoration: none;
      position: relative; transition: all .2s;
    }
    .cart-btn:hover { background: var(--primary); color: #fff; }
    .cart-badge {
      background: var(--primary); color: #fff;
      width: 18px; height: 18px; border-radius: 50%;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .cart-btn:hover .cart-badge { background: #fff; color: var(--primary); }
    .menu-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
    .menu-toggle span { display: block; width: 22px; height: 2px; background: var(--ink); border-radius: 2px; transition: all .2s; }
    .mobile-menu {
      border-top: 1.5px solid var(--border);
      background: var(--warm-white); padding: 12px 24px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .mobile-menu a, .mobile-menu button {
      padding: 12px 0; font-size: 15px; color: var(--ink);
      text-decoration: none; border: none; background: none;
      cursor: pointer; font-family: var(--font-body); text-align: left;
      border-bottom: 1px solid var(--border);
    }
    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
      .menu-toggle { display: flex; margin-left: auto; }
      .navbar { height: auto; min-height: var(--nav-h); }
      .nav-inner { flex-wrap: wrap; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  menuOpen = false;
  cartCount = this.cart.count;
  firstName = computed(() => this.auth.currentUser()?.firstName ?? '');

  logout(): void {
    this.auth.logout();
    this.cart.loadUserCart();
  }
}
