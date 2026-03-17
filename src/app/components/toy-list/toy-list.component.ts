import {Component, OnInit, inject, ChangeDetectorRef, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToyService } from '../../services/toy.service';
import { Toy, AgeGroup, ToyType, ToyFilter } from '../../models/models';
import { ToyCardComponent } from './toy-card.component';
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-toy-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ToyCardComponent],
  template: `
    <div class="container section">
      <div class="page-header">
        <h2>Sve igračke</h2>
        <button class="btn btn-outline btn-sm filter-toggle" (click)="filtersOpen = !filtersOpen">
          {{ filtersOpen ? '✕ Zatvori filtere' : '⚙ Filteri' }}
          @if (activeFilterCount > 0) {
            <span class="filter-badge">{{ activeFilterCount }}</span>
          }
        </button>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          class="search-input"
          type="text"
          placeholder="Pretraži igračke po nazivu..."
          [(ngModel)]="filter.name"
          (ngModelChange)="applyFilter()"
        />
        @if (filter.name) {
          <button class="search-clear" (click)="filter.name=''; applyFilter()">✕</button>
        }
      </div>

      <!-- Filters panel -->
      @if (filtersOpen) {
        <div class="filters-panel">
          <div class="filters-grid">
            <div class="form-group">
              <label>Opis</label>
              <input class="form-control" type="text" placeholder="Ključna reč u opisu"
                [(ngModel)]="filter.description" (ngModelChange)="applyFilter()">
            </div>
            <div class="form-group">
              <label>Tip igračke</label>
              <select class="form-control" [(ngModel)]="filter.typeId" (ngModelChange)="applyFilter()">
                <option [ngValue]="undefined">Svi tipovi</option>
                @for (t of toyTypes; track t.typeId) {
                  <option [ngValue]="t.typeId">{{ t.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Uzrast</label>
              <select class="form-control" [(ngModel)]="filter.ageGroupId" (ngModelChange)="applyFilter()">
                <option [ngValue]="undefined">Svi uzrasti</option>
                @for (a of ageGroups; track a.ageGroupId) {
                  <option [ngValue]="a.ageGroupId">{{ a.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Min cena (RSD)</label>
              <input class="form-control" type="number" placeholder="0"
                [(ngModel)]="filter.minPrice" (ngModelChange)="applyFilter()">
            </div>
            <div class="form-group">
              <label>Max cena (RSD)</label>
              <input class="form-control" type="number" placeholder="∞"
                [(ngModel)]="filter.maxPrice" (ngModelChange)="applyFilter()">
            </div>
            <div class="form-group">
              <label>Datum od</label>
              <input class="form-control" type="date"
                [(ngModel)]="filter.dateFrom" (ngModelChange)="applyFilter()">
            </div>
            <div class="form-group">
              <label>Datum do</label>
              <input class="form-control" type="date"
                [(ngModel)]="filter.dateTo" (ngModelChange)="applyFilter()">
            </div>
          </div>
          <button class="btn btn-ghost btn-sm mt-16" (click)="clearFilters()">Obriši sve filtere</button>
        </div>
      }

      <!-- Sort bar -->
      <div class="sort-bar">
        <span class="results-count">{{ filtered.length }} igračak{{ filtered.length === 1 ? 'a' : (filtered.length < 5 ? 'e' : 'a') }}</span>
        <div class="sort-controls">
          <label>Sortiraj:</label>
          <select class="form-control" [(ngModel)]="sortBy" (ngModelChange)="sort()">
            <option value="default">Podrazumevano</option>
            <option value="name_asc">Naziv A–Ž</option>
            <option value="name_desc">Naziv Ž–A</option>
            <option value="price_asc">Cena ↑</option>
            <option value="price_desc">Cena ↓</option>
            <option value="date_desc">Najnovije</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <div class="spinner"></div>
      } @else if (filtered.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Nema rezultata</h3>
          <p>Pokušajte sa drugačijim filterima</p>
          <button class="btn btn-outline mt-16" (click)="clearFilters()">Resetuj pretragu</button>
        </div>
      } @else {
        <div class="toy-grid">
          @for (toy of filtered; track toy.toyId) {
            <app-toy-card [toy]="toy" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .filter-badge {
      background: var(--primary); color: #fff;
      width: 18px; height: 18px; border-radius: 50%;
      font-size: 11px; display: inline-flex; align-items: center; justify-content: center;
    }
    .search-bar {
      position: relative; margin-bottom: 16px;
    }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--ink-muted); pointer-events: none; }
    .search-input {
      width: 100%; padding: 12px 48px; border: 1.5px solid var(--border);
      border-radius: var(--radius-md); background: var(--warm-white);
      font-family: var(--font-body); font-size: 16px; color: var(--ink);
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-pale); }
    .search-clear {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: var(--ink-muted); font-size: 16px; padding: 4px;
    }
    .filters-panel {
      background: var(--warm-white); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;
    }
    .filters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .sort-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .results-count { font-size: 14px; color: var(--ink-muted); font-weight: 500; }
    .sort-controls { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--ink-muted); }
    .sort-controls .form-control { padding: 6px 10px; font-size: 14px; width: auto; }
  `]
})
export class ToyListComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private toyService = inject(ToyService);
  private route = inject(ActivatedRoute);

  all: Toy[] = [];
  filtered: Toy[] = [];
  ageGroups: AgeGroup[] = [];
  toyTypes: ToyType[] = [];
  loading = true;
  filtersOpen = false;
  sortBy = 'default';
  filter: ToyFilter = {};

  get activeFilterCount(): number {
    return Object.values(this.filter).filter(v => v !== undefined && v !== '' && v !== null).length;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['search']) this.filtersOpen = true;
    });

    // Učitaj sve podatke paralelno, ali sačekaj da se svi završe
    forkJoin({
      toys: this.toyService.getAllToys(),
      ageGroups: this.toyService.getAgeGroups(),
      toyTypes: this.toyService.getToyTypes()
    }).subscribe({
      // U ToyListComponent, nakon što učitaš podatke:
      next: (result) => {
        this.all = result.toys;
        this.ageGroups = result.ageGroups;
        this.toyTypes = result.toyTypes;
        this.filtered = [...result.toys];
        this.loading = false;
        this.sort();

        // Forsiraj kompletnu detekciju promena
        this.cdr.detectChanges();

        // Dodatno: proveri prvu igračku
        console.log('Prva igračka:', result.toys[0]);
        console.log('Tip prve igračke:', result.toys[0].type);
      },
      error: (err) => {
        console.error('Greška pri učitavanju:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.filtered = this.toyService.filterToys(this.all, this.filter);
    this.sort();
  }

  sort(): void {
    const arr = [...this.filtered];
    switch (this.sortBy) {
      case 'name_asc': arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc': arr.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price_asc': arr.sort((a, b) => a.price - b.price); break;
      case 'price_desc': arr.sort((a, b) => b.price - a.price); break;
      case 'date_desc': arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    this.filtered = arr;
  }

  clearFilters(): void {
    this.filter = {};
    this.filtered = [...this.all];
    this.sort();
  }
}
