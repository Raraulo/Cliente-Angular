import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginResponse {
  ok: boolean | 'true' | 'false';
  token?: string;
  msg?: string;
  Registro?: {
    id: number;
    nombre: string;
    login: string;
    correo?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/login';

  // Estado reactivo del nombre del usuario
  private userSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('name')
  );
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // Método para iniciar sesión
  login(login: string, pass: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, {
      Login: login,
      Pass: pass
    }).pipe(
      tap(resp => {
        const ok = resp.ok === true || resp.ok === 'true';
        if (ok && resp.token && resp.Registro) {
          // ✅ Limpiar carrito previo
          localStorage.removeItem('carrito');

          // Guardar datos en localStorage
          localStorage.setItem('token', resp.token);
          localStorage.setItem('name', resp.Registro.nombre);
          localStorage.setItem('login', resp.Registro.login);
          localStorage.setItem('id', resp.Registro.id.toString());

          // Emitir nuevo usuario
          this.userSubject.next(resp.Registro.nombre);
        }
      })
    );
  }

  // Cerrar sesión y redirigir al home
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('login');
    localStorage.removeItem('id');
    localStorage.removeItem('carrito'); // ✅ Limpiar carrito al cerrar sesión
    this.userSubject.next(null);
    this.router.navigate(['/']);
  }

  // Obtener nombre de usuario activo
  get usuarioActivo(): string {
    return localStorage.getItem('name') ?? '';
  }

  // Obtener login (usado para verificar si es admin)
  get loginUsuario(): string {
    return localStorage.getItem('login') ?? '';
  }

  // Obtener ID como número
  get idUsuario(): number {
    return parseInt(localStorage.getItem('id') ?? '0', 10);
  }

  // Saber si está logueado
  get estaLogeado(): boolean {
    return !!localStorage.getItem('token');
  }

  // Verifica si el usuario es 'admin1'
  get esAdmin(): boolean {
    return this.loginUsuario === 'admin1';
  }
}
