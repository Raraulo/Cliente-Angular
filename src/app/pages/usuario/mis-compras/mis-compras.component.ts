// src/app/pages/usuario/mis-compras/mis-compras.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from '../../../services/factura.service';
import { Factura } from '../../../models/factura.models';

@Component({
  standalone: true,
  selector: 'app-mis-compras',
  imports: [CommonModule],
  templateUrl: './mis-compras.component.html',
  styleUrls: ['./mis-compras.component.css']
})
export class MisComprasComponent implements OnInit {
  facturas: Array<Factura & { subtotal: number; iva: number; showDetalle: boolean }> = [];
  cargando = true;

  constructor(private facturaService: FacturaService) {}

  ngOnInit(): void {
    this.facturaService.getFacturasDelUsuario().subscribe({
      next: res => {
        this.facturas = (res.facturas || []).map(f => {
          const subtotal = +(f.total / 1.15).toFixed(2);
          const iva      = +(f.total - subtotal).toFixed(2);
          return {
            ...f,
            subtotal,
            iva,
            showDetalle: false
          };
        });
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  toggleDetalle(item: Factura & { showDetalle?: boolean; id: number }): void {
    // Alternamos
    item.showDetalle = !item.showDetalle;

    if (item.showDetalle) {
      // Dejamos un tick para que Angular pinte el área de detalle
      setTimeout(() => {
        const el = document.getElementById(`factura-${item.id}`);
        if (el) {
          // Scrolleo suave hasta arriba de la tarjeta
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }
}
