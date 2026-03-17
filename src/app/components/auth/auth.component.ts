import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  favoriteToyTypes: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-visual">
        <div class="auth-visual-inner">
          <div class="auth-blob">
            <span class="auth-emoji">🧸</span>
          </div>
          <h2 class="auth-tagline">Pronađi savršenu igračku za<br><em>vaše dete</em></h2>
          <p>Registrujte se i pristupite stotinama igračaka za sve uzraste.</p>
        </div>
      </div>

      <div class="auth-form-wrap">
        <div class="auth-card">
          <!-- Tabs -->
          <div class="auth-tabs">
            <button class="auth-tab" [class.active]="mode() === 'login'" (click)="mode.set('login')">Prijava</button>
            <button class="auth-tab" [class.active]="mode() === 'register'" (click)="mode.set('register')">Registracija</button>
          </div>

          @if (errorMsg()) {
            <div class="auth-error">⚠ {{ errorMsg() }}</div>
          }
          @if (successMsg()) {
            <div class="auth-success">✓ {{ successMsg() }}</div>
          }

          <!-- LOGIN -->
          @if (mode() === 'login') {
            <form class="auth-form" (ngSubmit)="login()" #loginF="ngForm">
              <div class="form-group">
                <label>Email adresa</label>
                <input class="form-control" type="email" name="email"
                  placeholder="vas@email.com" [(ngModel)]="loginData.email" required>
              </div>
              <div class="form-group">
                <label>Lozinka</label>
                <div class="password-wrap">
                  <input class="form-control" [type]="showPwd ? 'text' : 'password'"
                    name="password" placeholder="••••••••"
                    [(ngModel)]="loginData.password" required>
                  <button type="button" class="pwd-toggle" (click)="showPwd = !showPwd">
                    {{ showPwd ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="loading()">
                @if (loading()) { Prijavljivanje... } @else { Prijavi se }
              </button>
              <p class="auth-switch">
                Nemate nalog?
                <button type="button" class="link-btn" (click)="mode.set('register')">Registrujte se</button>
              </p>
            </form>
          }

          <!-- REGISTER -->
          @if (mode() === 'register') {
            <form class="auth-form" (ngSubmit)="register()" #regF="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Ime</label>
                  <input class="form-control" type="text" name="firstName"
                    placeholder="Marija" [(ngModel)]="registerData.firstName" required>
                </div>
                <div class="form-group">
                  <label>Prezime</label>
                  <input class="form-control" type="text" name="lastName"
                    placeholder="Petrović" [(ngModel)]="registerData.lastName" required>
                </div>
              </div>
              <div class="form-group">
                <label>Email adresa</label>
                <input class="form-control" type="email" name="email"
                  placeholder="vas@email.com" [(ngModel)]="registerData.email" required>
              </div>
              <div class="form-group">
                <label>Broj telefona</label>
                <input class="form-control" type="tel" name="phone"
                  placeholder="+381 60 123 4567" [(ngModel)]="registerData.phone" required>
              </div>
              <div class="form-group">
                <label>Adresa dostave</label>
                <input class="form-control" type="text" name="address"
                  placeholder="Ulica i broj, Grad" [(ngModel)]="registerData.address" required>
              </div>
              <div class="form-group">
                <label>Omiljeni tipovi igračaka</label>
                <input class="form-control" type="text" name="favToys"
                  placeholder="npr. slagalica, figura, slikovnica"
                  [(ngModel)]="registerData.favoriteToyTypes">
                <small class="form-hint">Razdvojite zarezom</small>
              </div>
              <div class="form-group">
                <label>Lozinka</label>
                <div class="password-wrap">
                  <input class="form-control" [type]="showPwd ? 'text' : 'password'"
                    name="password" placeholder="Min. 6 znakova"
                    [(ngModel)]="registerData.password" required minlength="6">
                  <button type="button" class="pwd-toggle" (click)="showPwd = !showPwd">
                    {{ showPwd ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Potvrda lozinke</label>
                <input class="form-control" [type]="showPwd ? 'text' : 'password'"
                  name="confirmPassword" placeholder="Ponovite lozinku"
                  [(ngModel)]="registerData.confirmPassword" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%" [disabled]="loading()">
                @if (loading()) { Registracija u toku... } @else { Registruj se }
              </button>
              <p class="auth-switch">
                Već imate nalog?
                <button type="button" class="link-btn" (click)="mode.set('login')">Prijavite se</button>
              </p>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - var(--nav-h)); }

    .auth-visual {
      background: linear-gradient(135deg, #FBE8E0 0%, #F5D5C8 100%);
      display: flex; align-items: center; justify-content: center; padding: 48px;
    }
    .auth-visual-inner { max-width: 360px; text-align: center; }
    .auth-blob {
      width: 160px; height: 160px; margin: 0 auto 32px;
      background: white; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 5rem; box-shadow: var(--shadow-lg);
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .auth-tagline { font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 12px; color: var(--ink); }
    .auth-tagline em { color: var(--primary); font-style: italic; }
    .auth-visual p { color: var(--ink-soft); font-size: 15px; }

    .auth-form-wrap { display: flex; align-items: center; justify-content: center; padding: 48px 24px; background: var(--cream); }
    .auth-card { width: 100%; max-width: 440px; }

    .auth-tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 28px; }
    .auth-tab {
      flex: 1; padding: 12px; background: none; border: none;
      font-family: var(--font-body); font-size: 15px; font-weight: 600;
      color: var(--ink-muted); cursor: pointer; transition: all .2s;
      border-bottom: 2px solid transparent; margin-bottom: -2px;
    }
    .auth-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

    .auth-error { background: #FDECEA; border: 1.5px solid #F5C6C6; color: #C0392B; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }
    .auth-success { background: var(--green-pale); border: 1.5px solid #A8D5B5; color: var(--green); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }

    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-hint { font-size: 12px; color: var(--ink-muted); margin-top: 4px; }

    .password-wrap { position: relative; }
    .password-wrap .form-control { padding-right: 44px; }
    .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }

    .auth-switch { text-align: center; font-size: 14px; color: var(--ink-muted); margin-top: 4px; }
    .link-btn { background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; font-size: 14px; font-family: var(--font-body); text-decoration: underline; }

    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-visual { display: none; }
      .auth-form-wrap { padding: 32px 16px; align-items: flex-start; }
    }
  `]
})
export class AuthComponent implements OnInit {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  showPwd = false;
  returnUrl = '/';

  loginData = { email: '', password: '' };
  registerData: RegisterForm = {
    firstName: '', lastName: '', email: '',
    phone: '', address: '', favoriteToyTypes: '',
    password: '', confirmPassword: ''
  };

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) { this.router.navigate(['/']); return; }
    this.route.queryParams.subscribe(p => {
      if (p['mode'] === 'register') this.mode.set('register');
      this.returnUrl = p['returnUrl'] || '/';
    });
  }

  login(): void {
    this.errorMsg.set(''); this.loading.set(true);
    const res = this.auth.login(this.loginData.email, this.loginData.password);
    this.loading.set(false);
    if (res.success) {
      this.cart.loadUserCart();
      this.router.navigate([this.returnUrl]);
    } else {
      this.errorMsg.set(res.message);
    }
  }

  register(): void {
    this.errorMsg.set('');
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMsg.set('Lozinke se ne poklapaju.'); return;
    }
    if (this.registerData.password.length < 6) {
      this.errorMsg.set('Lozinka mora imati najmanje 6 znakova.'); return;
    }
    this.loading.set(true);
    const favs = this.registerData.favoriteToyTypes
      .split(',').map(s => s.trim()).filter(Boolean);
    const res = this.auth.register({
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      email: this.registerData.email,
      phone: this.registerData.phone,
      address: this.registerData.address,
      favoriteToyTypes: favs,
      password: this.registerData.password
    });
    this.loading.set(false);
    if (res.success) {
      this.cart.loadUserCart();
      this.successMsg.set('Uspešna registracija! Preusmeravanje...');
      setTimeout(() => this.router.navigate([this.returnUrl]), 1200);
    } else {
      this.errorMsg.set(res.message);
    }
  }
}
