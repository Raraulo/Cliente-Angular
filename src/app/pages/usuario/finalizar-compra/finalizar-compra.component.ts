import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../../services/cart.service';
import { FacturaService } from '../../../services/factura.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';  // Importa SweetAlert2

@Component({
  standalone: true,
  selector: 'app-finalizar-compra',
  imports: [CommonModule, FormsModule],
  templateUrl: './finalizar-compra.component.html',
  styleUrls: ['./finalizar-compra.component.css']
})
export class FinalizarCompraComponent implements OnInit {
  productos: CartItem[] = [];
  subtotal$!: Observable<number>;
  iva$!: Observable<number>;
  total$!: Observable<number>;
  metodoPago: string = '';
  personaID: number = 0;

  readonly IVA = 0.15; // 15% IVA

  constructor(
    private cartService: CartService,
    private facturaService: FacturaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribe a los items del carrito
    this.cartService.items$.subscribe(items => {
      this.productos = items;
    });

    // Calcula subtotal, iva y total
    this.subtotal$ = this.cartService.subtotal$.pipe(
      map(sub => this.calcularSubtotalSinIva(sub))
    );

    this.iva$ = this.subtotal$.pipe(
      map(sub => +(sub * this.IVA).toFixed(2))
    );

    this.total$ = this.subtotal$.pipe(
      map(sub => +(sub * (1 + this.IVA)).toFixed(2))
    );

    // Extraer ID del payload del JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.personaID = payload.Id || payload.id || 0;
      } catch (e) {
        console.error('Token inválido', e);
      }
    }
  }

  confirmarCompra(): void {
    // Validaciones básicas
    if (!this.metodoPago) {
      alert('Selecciona un método de pago');
      return;
    }
    if (this.productos.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    for (const item of this.productos) {
      if (item.producto.id == null) {
        alert(`El producto "${item.producto.nombre}" no tiene un ID válido.`);
        return;
      }
    }

    // Construir payload
    const payload = {
      persona_id: this.personaID,
      metodo_pago: this.metodoPago,
      detalles: this.productos.map(p => ({
        producto_id: p.producto.id!,
        cantidad: p.cantidad
      }))
    };

    // Llamar al servicio
    this.facturaService.finalizarCompra(payload).subscribe({
      next: () => {
        // Mostrar mensaje de éxito con SweetAlert
        Swal.fire({
          icon: 'success',
          title: '¡Gracias por tu compra!',
          text: 'Tu compra ha sido realizada con éxito.',
          confirmButtonText: 'Aceptar'
        });
        
        this.cartService.clearCart();
        this.router.navigate(['/usuario/mis-compras']);
      },
      error: (error: any) => {
        console.error('Error al realizar la compra', error);
        alert('❌ Error al realizar la compra - Prueba cerrando e iniciando sesión nuevamente');
      }
    });
  }

  // ✅ Subtotal sin IVA (calculando el precio sin IVA)
  calcularSubtotalSinIva(subtotalConIva: number): number {
    return +(subtotalConIva / (1 + this.IVA)).toFixed(2);
  }

  // ✅ Precio unitario sin IVA
  precioSinIva(precioConIva: number): number {
    return +(precioConIva / (1 + this.IVA)).toFixed(2);
  }

  // ✅ IVA de un precio con IVA
  calcularIva(precioConIva: number): number {
    const sinIva = this.precioSinIva(precioConIva);
    return +(precioConIva - sinIva).toFixed(2);
  }

}
