import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-granja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './granja.component.html',
  styleUrls: ['./granja.component.css']
})
export class GranjaComponent implements OnInit {
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  filtroCategoria: string = 'todos';
  busqueda: string = '';

  constructor(
    private productoService: ProductosService,
    public auth: AuthService,
    private carritoService: CartService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe((data: Producto[]) => {
      this.productos = data.filter((p: Producto) => p.animal_id === 6); // animales de granja
    });
  }

  productosFiltrados(): Producto[] {
    return this.productos.filter((p: Producto) => {
      const coincideCategoria =
        this.filtroCategoria === 'todos' || p.categoria?.toLowerCase() === this.filtroCategoria;
      const coincideBusqueda =
        this.busqueda.trim() === '' || p.nombre?.toLowerCase().includes(this.busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }

  abrirModal(p: Producto): void {
    this.productoSeleccionado = { ...p };
  }

  abrirModalNuevo(): void {
    this.productoSeleccionado = {
      id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagen_url: '',
      animal_id: 6, // Fijo para animales de granja
      disponible: true,
      fecha_ingreso: new Date().toISOString(),
      categoria: 'otro'
    };
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
  }

  guardarNuevoProducto(): void {
    if (this.productoSeleccionado) {
      this.productoSeleccionado.animal_id = 6; // Seguridad
      this.productoService.createProducto(this.productoSeleccionado).subscribe(() => {
        this.cargarProductos();
        this.cerrarModal();
      });
    }
  }

  actualizarProducto(): void {
    if (this.productoSeleccionado) {
      this.productoSeleccionado.animal_id = 6; // Mantener fijo
      this.productoService.updateProducto(this.productoSeleccionado.id!, this.productoSeleccionado).subscribe(() => {
        this.cargarProductos();
        this.cerrarModal();
      });
    }
  }

  eliminarProducto(): void {
    if (this.productoSeleccionado && this.productoSeleccionado.id) {
      const confirmar = confirm('¿Estás seguro de eliminar este producto?');
      if (confirmar) {
        this.productoService.deleteProducto(this.productoSeleccionado.id).subscribe(() => {
          this.cargarProductos();
          this.cerrarModal();
        });
      }
    }
  }

  anadirAlCarrito(p: Producto): void {
    this.carritoService.addToCart(p);
    this.cerrarModal();
  }

  anadirAFavoritos(p: Producto): void {
    console.log('Añadido a favoritos:', p.nombre);
  }
}
