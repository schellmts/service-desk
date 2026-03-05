import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Layout } from '../../components/layout/layout.component';

@Component({
  selector: 'app-integracao',
  imports: [CommonModule, RouterModule, Layout],
  templateUrl: './integracao.component.html',
  styleUrl: './integracao.component.css'
})
export class IntegracaoComponent {}
