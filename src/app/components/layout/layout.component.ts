import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { FloatingChatComponent } from '../floating-chat/floating-chat.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, FloatingChatComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class Layout implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);
  
  sidebarOpen = false;
  currentUser = signal(this.authService.getCurrentUser());

  constructor() {
    // Atualiza o signal quando o usuário mudar
    effect(() => {
      const user = this.authService.getCurrentUserSignal()();
      this.currentUser.set(user);
    });
  }

  ngOnInit(): void {
    // Atualiza o signal inicial
    this.currentUser.set(this.authService.getCurrentUser());
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout() {
    Swal.fire({
      title: 'Sair?',
      text: 'Deseja realmente sair do sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
