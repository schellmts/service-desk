import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user' | 'tecnico';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'axis_user_session';
  private readonly USERS_KEY = 'axis_users';
  
  // Usuários padrão para demonstração
  private readonly DEFAULT_USERS = [
    { id: '1', email: 'admin@axis.com', senha: 'admin123', nome: 'Administrador', role: 'admin' as const },
    { id: '2', email: 'user@axis.com', senha: 'user123', nome: 'Usuário Teste', role: 'user' as const },
    { id: '3', email: 'tecnico@axis.com', senha: 'tec123', nome: 'Técnico Suporte', role: 'tecnico' as const }
  ];

  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadSession();
    this.initializeUsers();
  }

  private initializeUsers(): void {
    const existingUsers = localStorage.getItem(this.USERS_KEY);
    if (!existingUsers) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.DEFAULT_USERS));
    }
  }

  private loadSession(): void {
    const session = localStorage.getItem(this.STORAGE_KEY);
    if (session) {
      try {
        const user = JSON.parse(session);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      } catch (e) {
        console.error('Erro ao carregar sessão:', e);
        this.logout();
      }
    }
  }

  login(email: string, senha: string): { success: boolean; message?: string; user?: User } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.senha === senha);

    if (!user) {
      return { success: false, message: 'Email ou senha incorretos' };
    }

    const userSession: User = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userSession));
    this._currentUser.set(userSession);
    this._isAuthenticated.set(true);

    return { success: true, user: userSession };
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  getCurrentUser(): User | null {
    return this._currentUser();
  }

  getCurrentUserSignal() {
    return this._currentUser.asReadonly();
  }

  isAuthenticatedSignal() {
    return this._isAuthenticated.asReadonly();
  }

  private getUsers(): Array<{ id: string; email: string; senha: string; nome: string; role: 'admin' | 'user' | 'tecnico' }> {
    const users = localStorage.getItem(this.USERS_KEY);
    if (users) {
      try {
        return JSON.parse(users);
      } catch (e) {
        return this.DEFAULT_USERS;
      }
    }
    return this.DEFAULT_USERS;
  }
}
