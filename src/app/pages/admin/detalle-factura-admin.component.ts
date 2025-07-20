import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgForOf, AsyncPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { FacturaService } from '../../services/factura.service';
import { map, switchMap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Factura } from '../../models/factura.models';@Component({
  standalone: true,
  selector: 'app-detalle-factura-admin',
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    AsyncPipe,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './detalle-factura-admin.component.html'
})
export class DetalleFacturaAdminComponent implements OnInit {
  factura$!: Observable<
    Factura & {
      detalle: Array<{
        producto_nombre: string;
        cantidad: number;
        precio_unitario: number;
        imagen: string;
      }>;
      persona: {
        nombre: string;
        apellido: string;
        cedula: string;
        mail: string;
        telefono?: string;
        direccion?: string;
      };
      subtotal: number;
    }  >;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facturaService: FacturaService
  ) {}  ngOnInit(): void {
    // Scroll al tope al cargar el componente
    window.scrollTo({ top: 0, behavior: 'smooth' });this.factura$ = this.route.paramMap.pipe(
  map(params => Number(params.get('id'))),
  filter(id => !isNaN(id)),
  switchMap(id => this.facturaService.getFactura(id)),
  map(resp => {
    const factura = resp.factura;
    const subtotal = (factura.detalle || []).reduce(
      (acc, item) => acc + item.precio_unitario * item.cantidad,
      0
    );

    return {
      ...factura,
      subtotal,
      persona: factura.persona || {
        nombre: 'Desconocido',
        apellido: '',
        cedula: 'N/A',
        mail: 'N/A',
        telefono: '',
        direccion: ''
      }
    };
  })
);  }  volver(): void {
    this.router.navigate(['/perfil']);
  }
}

