import { Injectable, signal } from '@angular/core';
import { UserProfile } from '../models/models';

const USERS_KEY = 'toy_shop_users';
const SESSION_KEY = 'toy_shop_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<UserProfile | null>(null);

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    const userId = localStorage.getItem(SESSION_KEY);
    if (userId) {
      const users = this.getUsers();
      const user = users.find(u => u.userId === userId);
      if (user) this.currentUser.set(user);
    }
  }

  private getUsers(): UserProfile[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUsers(users: UserProfile[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  register(data: Omit<UserProfile, 'userId' | 'cart'>): { success: boolean; message: string } {
    const users = this.getUsers();
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'Email već postoji.' };
    }
    const newUser: UserProfile = {
      ...data,
      userId: crypto.randomUUID(),
      password: btoa(data.password),
      cart: []
    };
    users.push(newUser);
    this.saveUsers(users);
    this.currentUser.set(newUser);
    localStorage.setItem(SESSION_KEY, newUser.userId);
    return { success: true, message: 'Registracija uspešna!' };
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { success: false, message: 'Pogrešan email ili lozinka.' };
    this.currentUser.set(user);
    localStorage.setItem(SESSION_KEY, user.userId);
    return { success: true, message: 'Prijava uspešna!' };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  updateProfile(updated: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === updated.userId);
    if (idx !== -1) {
      users[idx] = updated;
      this.saveUsers(users);
      this.currentUser.set(updated);
    }
  }

  saveCart(userId: string, cart: any[]): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === userId);
    if (idx !== -1) {
      users[idx].cart = cart;
      this.saveUsers(users);
      const updated = { ...this.currentUser()!, cart };
      this.currentUser.set(updated);
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
