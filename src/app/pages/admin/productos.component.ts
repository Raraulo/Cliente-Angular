import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { Producto } from '../../models/producto.model';
import { Categoria } from '../../models/categoria.model';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  animales: Animal[] = [];

  productoSeleccionado: Producto | null = null;
  filtroCategoria: string = 'todos';

  constructor(
    private productosService: ProductosService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarAnimales();
  }

  cargarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: (resp: any) => {
        const lista = resp?.Registro ?? resp;
        this.productos = lista;
      },
      error: (e) => console.error('Error al cargar productos', e)
    });
  }

  cargarCategorias(): void {
    this.productosService.getCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
      },
      error: (e) => console.error('Error al cargar categorías', e)
    });
  }

  cargarAnimales(): void {
    this.productosService.getAnimales().subscribe({
      next: (data: Animal[]) => {
        this.animales = data;
      },
      error: (e) => console.error('Error al cargar animales', e)
    });
  }

  crearProductoVacio(): Producto {
    return {
      id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagen_url: '',
      animal_id: 1,
      disponible: true,
      fecha_ingreso: new Date().toISOString(),
      categoria: '' // ← importante
    };
  }


  abrirModal(p: Producto) {
    this.productoSeleccionado = { ...p };
  }

  cerrarModal() {
    this.productoSeleccionado = null;
  }

  abrirModalNuevo() {
    this.productoSeleccionado = this.crearProductoVacio();
  }

  guardarNuevoProducto() {
    if (!this.productoSeleccionado) return;

    this.productoSeleccionado.animal_id = Number(this.productoSeleccionado.animal_id);

    this.productosService.createProducto(this.productoSeleccionado).subscribe({
      next: () => {
        alert('Producto creado');
        this.cargarProductos();
        this.cerrarModal();
      },
      error: (e) => {
        console.error("Error al crear producto", e);
      }
    });
  }

  actualizarProducto() {
    if (this.productoSeleccionado && this.productoSeleccionado.id) {
      this.productosService.updateProducto(
        this.productoSeleccionado.id,
        this.productoSeleccionado
      ).subscribe({
        next: () => {
          alert('Producto actualizado');
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (e) => {
          console.error("Error al actualizar producto", e);
        }
      });
    }
  }

  eliminarProducto() {
    if (this.productoSeleccionado && confirm('¿Estás seguro de eliminar este producto?')) {
      this.productosService.deleteProducto(this.productoSeleccionado.id!).subscribe({
        next: () => {
          alert('Producto eliminado');
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (e) => {
          console.error("Error al eliminar producto", e);
        }
      });
    }
  }

  productosFiltrados(): Producto[] {
    if (this.filtroCategoria === 'todos') {
      return this.productos;
    }
    return this.productos.filter(p =>
      p.animal_id === Number(this.filtroCategoria)
    );
  }

  // ✅ Evita usar funciones flecha en el HTML
  getNombreAnimal(animalId: number): string {
    const animal = this.animales.find(a => a.id === animalId);
    return animal ? animal.nombre : 'Desconocido';
  }
}
