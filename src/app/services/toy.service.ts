import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Toy, AgeGroup, ToyType, ToyFilter } from '../models/models';

const BASE = 'https://toy.pequla.com/api';

// Gender mapping by ageGroup name heuristic (API doesn't have gender field)
// We assign locally for demo purposes
const GENDER_MAP: Record<number, string> = {};

@Injectable({ providedIn: 'root' })
export class ToyService {
  constructor(private http: HttpClient) {}

  getAllToys(): Observable<Toy[]> {
    return this.http.get<Toy[]>(`${BASE}/toy`);
  }

  getToyById(id: number): Observable<Toy> {
    return this.http.get<Toy>(`${BASE}/toy/${id}`);
  }

  getToyByPermalink(permalink: string): Observable<Toy> {
    return this.http.get<Toy>(`${BASE}/toy/permalink/${permalink}`);
  }

  getToysByIds(ids: number[]): Observable<Toy[]> {
    return this.http.post<Toy[]>(`${BASE}/toy/list`, ids);
  }

  getAgeGroups(): Observable<AgeGroup[]> {
    return this.http.get<AgeGroup[]>(`${BASE}/age-group`);
  }

  getToyTypes(): Observable<ToyType[]> {
    return this.http.get<ToyType[]>(`${BASE}/type`);
  }

  filterToys(toys: Toy[], filter: ToyFilter): Toy[] {
    return toys.filter(toy => {
      if (filter.name && !toy.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
      if (filter.description && !toy.description?.toLowerCase().includes(filter.description.toLowerCase())) return false;
      if (filter.typeId && toy.type?.typeId !== filter.typeId) return false;
      if (filter.ageGroupId && toy.ageGroup?.ageGroupId !== filter.ageGroupId) return false;
      if (filter.minPrice !== undefined && toy.price < filter.minPrice) return false;
      if (filter.maxPrice !== undefined && toy.price > filter.maxPrice) return false;
      if (filter.dateFrom && new Date(toy.createdAt) < new Date(filter.dateFrom)) return false;
      if (filter.dateTo && new Date(toy.createdAt) > new Date(filter.dateTo)) return false;
      return true;
    });
  }
}
