import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false;
  lembrarMe: boolean = false;
  loading: boolean = false;
  error: string = '';

  toggleMostrarSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  onSubmit() {
    if (!this.email || !this.senha) {
      this.error = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.error = '';

    const result = this.authService.login(this.email, this.senha);

    if (result.success && result.user) {
      Swal.fire({
        icon: 'success',
        title: 'Login realizado!',
        text: `Bem-vindo, ${result.user.nome}!`,
        confirmButtonColor: '#06002E',
        timer: 1500,
        showConfirmButton: false
      });

      // Redireciona para a URL de retorno ou dashboard
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigate([returnUrl]);
    } else {
      this.error = result.message || 'Erro ao fazer login';
      this.loading = false;
    }
  }
}
