import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToyService } from '../../services/toy.service';
import { Toy } from '../../models/models';
import { ToyCardComponent } from '../toy-list/toy-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ToyCardComponent],
  template: `
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="container hero-content">
        <div class="hero-text">
          <span class="hero-label">Dobrodošli u</span>
          <h1>Pequla<em>Toys</em></h1>
          <p class="hero-desc">Pronađite savršenu igračku za vaše dete. Pažljivo izabrani skup igračaka za sve uzraste i interesovanja.</p>
          <div class="hero-actions">
            <a routerLink="/toys" class="btn btn-primary btn-lg">Pregledaj igračke</a>
            <a routerLink="/toys" [queryParams]="{search:true}" class="btn btn-outline btn-lg">Pretraga</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-blob">
            <span class="blob-emoji">🧸</span>
            <span class="blob-emoji e2">🚂</span>
            <span class="blob-emoji e3">🎨</span>
            <span class="blob-emoji e4">🪀</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">🔍</span>
            <h3>Napredna pretraga</h3>
            <p>Filtrirajte po uzrastu, tipu, ceni, ocenama i još mnogo toga.</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🛒</span>
            <h3>Laka rezervacija</h3>
            <p>Dodajte u korpu i rezervišite omiljene igračke u par klikova.</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">⭐</span>
            <h3>Recenzije roditelja</h3>
            <p>Čitajte iskustva drugih kupaca pre nego što odlučite.</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">👤</span>
            <h3>Lični profil</h3>
            <p>Pratite sve rezervacije i istoriju kupovine na jednom mestu.</p>
          </div>
        </div>
      </div>
    </section>

    @if (featured.length > 0) {
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Istaknute igračke</h2>
            <a routerLink="/toys" class="btn btn-ghost btn-sm">Pogledaj sve →</a>
          </div>
          <div class="toy-grid">
            @for (toy of featured; track toy.toyId) {
              <app-toy-card [toy]="toy" />
            }
          </div>
        </div>
      </section>
    }

    @if (loading) {
      <div class="spinner"></div>
    }
  `,
  styles: [`
    .hero {
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, #FFF8EE 0%, #FBE8E0 100%);
      padding: 72px 0 80px;
    }
    .hero-bg {
      position: absolute; inset: 0; opacity: .04;
      background-image: radial-gradient(circle, var(--ink) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .hero-content {
      display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
      align-items: center; position: relative;
    }
    .hero-label {
      font-size: 13px; font-weight: 600; letter-spacing: .1em;
      text-transform: uppercase; color: var(--primary); margin-bottom: 12px;
      display: block;
    }
    .hero-text h1 { color: var(--ink); margin-bottom: 20px; }
    .hero-text h1 em { color: var(--primary); font-style: italic; }
    .hero-desc { font-size: 1.1rem; color: var(--ink-soft); margin-bottom: 32px; max-width: 480px; }
    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .hero-visual { display: flex; justify-content: center; }
    .hero-blob {
      width: 320px; height: 320px; border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%;
      background: var(--primary-pale); position: relative;
      animation: blobMorph 8s ease-in-out infinite;
      display: flex; align-items: center; justify-content: center;
    }
    @keyframes blobMorph {
      0%, 100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
      33% { border-radius: 40% 60% 45% 55% / 60% 40% 55% 45%; }
      66% { border-radius: 55% 45% 40% 60% / 45% 55% 60% 40%; }
    }
    .blob-emoji { position: absolute; font-size: 3rem; animation: float 3s ease-in-out infinite; }
    .blob-emoji { top: 50%; left: 50%; transform: translate(-50%,-50%); }
    .blob-emoji.e2 { top: 20%; left: 15%; font-size: 2rem; animation-delay: .5s; }
    .blob-emoji.e3 { top: 15%; right: 15%; font-size: 2rem; animation-delay: 1s; }
    .blob-emoji.e4 { bottom: 20%; right: 20%; font-size: 1.8rem; animation-delay: 1.5s; }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .blob-emoji { transform: none; }
    .features-section { background: var(--warm-white); border-top: 1.5px solid var(--border); border-bottom: 1.5px solid var(--border); }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }
    .feature-card {
      padding: 28px; border-radius: var(--radius-lg);
      border: 1.5px solid var(--border); background: var(--cream);
      transition: box-shadow .2s, transform .2s;
    }
    .feature-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
    .feature-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
    .feature-card h3 { font-family: var(--font-display); margin-bottom: 8px; }
    .feature-card p { color: var(--ink-muted); font-size: 14px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    @media (max-width: 768px) {
      .hero-content { grid-template-columns: 1fr; gap: 40px; }
      .hero-visual { display: none; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private toyService = inject(ToyService);
  featured: Toy[] = [];
  loading = true;

  ngOnInit(): void {
    this.toyService.getAllToys().subscribe({
      next: (toys) => {
        this.featured = toys.slice(0, 4);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
