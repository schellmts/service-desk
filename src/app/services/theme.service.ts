import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'axis-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = signal<boolean>(this.loadInitial());

  isDark = computed(() => this.darkMode());
  isLight = computed(() => !this.darkMode());

  private loadInitial(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    /* padrão: tema claro (light); mudanças são armazenadas no localStorage */
    return false;
  }

  constructor() {
    this.apply(this.darkMode());
  }

  toggle(): void {
    this.darkMode.update(v => !v);
    this.apply(this.darkMode());
    localStorage.setItem(STORAGE_KEY, this.darkMode() ? 'dark' : 'light');
  }

  setDark(value: boolean): void {
    this.darkMode.set(value);
    this.apply(value);
    localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light');
  }

  private apply(dark: boolean): void {
    const doc = document.documentElement;
    doc.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
