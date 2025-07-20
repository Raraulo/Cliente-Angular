import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Router }         from '@angular/router';

import { UserService, Persona } from '../../services/user.service';
import { AuthService           } from '../../services/auth.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-modal.component.html',
})
export class RegisterModalComponent {

  /* ---------- comunicación con el padre ---------- */
  @Output() close = new EventEmitter<void>();

  /* ---------- modelo de formulario ---------- */
  cedula     = '';
  nombre     = '';
  apellido   = '';
  mail       = '';
  usuario    = '';
  telefono   = '';
  sexo       = '';            // 'H' | 'M'
  direccion  = '';

  pass       = '';
  pass2      = '';
  passVisible  = false;       // ← para mostrar/ocultar
  pass2Visible = false;

  errorMsg   = '';
  success    = false;         // para alternar a la alerta

  constructor(
    private userSvc: UserService,
    private auth   : AuthService,
    private router : Router
  ) {}

  /* -------- alta de usuario + login automático -------- */
  registrar(): void {
    this.errorMsg = '';

    /* validaciones rápidas */
    if (!this.cedula || !this.nombre || !this.usuario || !this.pass) {
      this.errorMsg = 'Completa los campos obligatorios marcados con *';
      return;
    }
    if (this.pass !== this.pass2) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    const nuevo: Persona = {
      cedula   : this.cedula,
      nombre   : this.nombre,
      apellido : this.apellido,
      mail     : this.mail,
      login    : this.usuario,
      password : this.pass,
      telefono : this.telefono,
      sexo     : this.sexo,
      direccion: this.direccion,
    };

    /* 1️⃣  crear en backend */
    this.userSvc.create(nuevo).subscribe({
      next: () => {
        /* 2️⃣  login inmediato */
        this.auth.login(this.usuario, this.pass).subscribe({
          next : () => (this.success = true),            // muestra alerta
          error: ()  => (this.errorMsg = 'Error al iniciar sesión'),
        });
      },
      error: err => {
        this.errorMsg =
          err.status === 409 ? 'El usuario ya existe' : 'Error al registrar';
      },
    });
  }

  /* -------- cerrar alerta + modal, y volver al home -------- */
  cerrarTodo(): void {
    this.success = false;
    this.close.emit();        // informa al padre para ocultar modal
    this.router.navigate(['/']);
  }
}
