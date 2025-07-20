import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-facturas.component.html'
})
export class AdminFacturasComponent implements OnInit {
  facturas: any[] = [];
  error = '';

  constructor(private http: HttpClientModule, public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.auth.esAdmin) {
      this.router.navigate(['/']);
      return;
    }

    this.cargarFacturas();
  }

  cargarFacturas() {
    fetch('http://localhost:4000/api/factura', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(resp => resp.json())
      .then(data => this.facturas = data.facturas ?? [])
      .catch(() => this.error = 'No se pudo cargar las facturas');
  }

  eliminar(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;

    fetch(`http://localhost:4000/api/factura/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => this.cargarFacturas())
      .catch(() => this.error = 'Error al eliminar');
  }
}
