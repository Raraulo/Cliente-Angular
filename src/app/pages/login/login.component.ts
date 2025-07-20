import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { RegisterModalComponent } from '../register-modal/register-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RegisterModalComponent
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  /* ---------- propiedades del formulario ---------- */
  username = '';
  password = '';
  showPassword = false;
  errorMsg = '';

  /* ---------- control del modal registro ---------- */
  mostrarRegistro = false;
  abrirRegistro() { this.mostrarRegistro = true; }
  cerrarRegistro() { this.mostrarRegistro = false; }

  constructor(private auth: AuthService, private router: Router) {}

  /* ---------- enviar login ---------- */
onSubmit(): void {
  this.errorMsg = '';

  this.auth.login(this.username, this.password).subscribe({
    next: resp => {
      const ok = resp.ok === true || resp.ok === 'true';
      if (ok && resp.token && resp.Registro) {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('name', resp.Registro.nombre);
        localStorage.setItem('login', resp.Registro.login);
        localStorage.setItem('id', resp.Registro.id.toString());
        this.router.navigate(['/']);
      } else {
        this.errorMsg = resp.msg ?? 'Credenciales incorrectas';
      }
    },
    error: () => this.errorMsg = 'Error de conexión o credenciales inválidas'
  });
}

  onCreateAccount() {
    this.abrirRegistro();
  }
}
