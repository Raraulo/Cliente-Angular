import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule // ✅ Necesario para usar routerLink en el HTML
  ],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  usuario: any = {};
  modoEdicion = false;

  mostrarMenu = false;
  mostrarFacturas = false;
  mostrarPersonas = false;

  personas: any[] = [];
  facturas: Array<any & { clienteNombre: string; clienteApellido: string }> = [];

  personaEditando: any = null;
  formPersona: any = {
    nombre: '',
    apellido: '',
    login: '',
    mail: '',
    password: '',
    telefono: '',
    direccion: '',
    sexo: ''
  };

  // --- Filtros buscador ---
  filtroCedula = '';
  filtroApellido = '';
  filtroNombreFactura: string = '';
filtroApellidoFactura: string = '';

  @ViewChild('facturasSection') facturasSection!: ElementRef;
  @ViewChild('personasSection') personasSection!: ElementRef;

  constructor(
    public auth: AuthService,
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit(): void {
    const id = this.auth.idUsuario;

    this.http.get<any>(`http://localhost:4000/api/user/${id}`)
      .subscribe({
        next: resp => this.usuario = resp.Registro,
        error: err => console.error('Error al obtener usuario', err)
      });

    if (this.auth.esAdmin) {
      this.cargarPersonas()
        .pipe(switchMap(() => this.cargarFacturas()))
        .subscribe({
          error: err => console.error('Error al cargar facturas', err)
        });
    }
  }

  goMisCompras(): void {
    this.router.navigate(['/usuario/mis-compras']);
  }

  cargarPersonas(): Observable<any> {
    return this.http.get<any>('http://localhost:4000/api/user').pipe(
      tap(resp => this.personas = resp.Registro || [])
    );
  }

  cargarFacturas(): Observable<any> {
    return this.http.get<any>('http://localhost:4000/api/factura').pipe(
      tap(resp => {
        this.facturas = (resp.facturas || []).map((f: any) => {
          const p = this.personas.find(x => x.id === f.persona_id) || {};
          return {
            ...f,
            clienteNombre: p.nombre || '—',
            clienteApellido: p.apellido || ''
          };
        });
      })
    );
  }

  toggleMenu(): void {
    this.mostrarMenu = !this.mostrarMenu;
  }

  toggleFacturas(): void {
    this.mostrarFacturas = !this.mostrarFacturas;
    setTimeout(() => {
      this.facturasSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  togglePersonas(): void {
    this.mostrarPersonas = !this.mostrarPersonas;
    setTimeout(() => {
      this.personasSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }

  cancelar(): void {
    this.modoEdicion = false;
  }

  guardarCambios(): void {
    const id = this.auth.idUsuario;
    this.http.put(`http://localhost:4000/api/user/${id}`, this.usuario).subscribe({
      next: () => {
        this.modoEdicion = false;
        alert('Datos actualizados');
      },
      error: () => alert('Error al actualizar')
    });
  }

  eliminarUsuario(): void {
    const id = this.auth.idUsuario;
    if (confirm('¿Eliminar usuario?')) {
      this.http.delete(`http://localhost:4000/api/user/${id}`).subscribe(() => {
        this.auth.logout();
        window.location.href = '/';
      });
    }
  }

  irAReportes() {
    this.router.navigate(['/admin/reportes']);
  }

  abrirModalCrear(): void {
    this.personaEditando = null;
    this.formPersona = {
      nombre: '', apellido: '', login: '', mail: '', password: '',
      telefono: '', direccion: '', sexo: ''
    };
    const modal = document.getElementById('modal-persona');
    const contenido = document.getElementById('modal-contenido');
    if (modal && contenido) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        contenido.classList.remove('scale-95', 'opacity-0');
        contenido.classList.add('scale-100', 'opacity-100');
      }, 50);
    }
  }

  abrirModalEditar(p: any): void {
    this.personaEditando = p;
    this.formPersona = { ...p };
    const modal = document.getElementById('modal-persona');
    const contenido = document.getElementById('modal-contenido');
    if (modal && contenido) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        contenido.classList.remove('scale-95', 'opacity-0');
        contenido.classList.add('scale-100', 'opacity-100');
      }, 50);
    }
  }

  cerrarModal(): void {
    const modal = document.getElementById('modal-persona');
    const contenido = document.getElementById('modal-contenido');
    if (modal && contenido) {
      contenido.classList.remove('scale-100', 'opacity-100');
      contenido.classList.add('scale-95', 'opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 200);
    }
  }

  guardarPersona(): void {
    const request = this.personaEditando
      ? this.http.put(`http://localhost:4000/api/user/${this.personaEditando.id}`, this.formPersona)
      : this.http.post('http://localhost:4000/api/user', this.formPersona);

    request.subscribe({
      next: () => {
        this.cargarPersonas().subscribe();
        this.cerrarModal();
      },
      error: err => {
        alert('Error al guardar persona');
        console.error(err);
      }
    });
  }

  eliminarPersona(id: number): void {
    if (confirm('¿Eliminar esta persona?')) {
      this.http.delete(`http://localhost:4000/api/user/${id}`).subscribe(() => {
        this.cargarPersonas().subscribe();
      });
    }
  }
get facturasFiltradas() {
  return this.facturas.filter(f => {
    const nombre = (f.clienteNombre || '').toLowerCase();
    const apellido = (f.clienteApellido || '').toLowerCase();
    const filtroNombre = (this.filtroNombreFactura || '').toLowerCase();
    const filtroApellido = (this.filtroApellidoFactura || '').toLowerCase();
    return (
      nombre.includes(filtroNombre) &&
      apellido.includes(filtroApellido)
    );
  });
}
  // --- Métodos para el filtrado manual ---
  get personasFiltradas() {
    return this.personas.filter(p => {
      const cedulaOk = !this.filtroCedula || (p.cedula || '').toLowerCase().includes(this.filtroCedula.toLowerCase());
      const apellidoOk = !this.filtroApellido || (p.apellido || '').toLowerCase().includes(this.filtroApellido.toLowerCase());
      return cedulaOk && apellidoOk;
    });
  }
}
