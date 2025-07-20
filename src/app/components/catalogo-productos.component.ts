import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../app/services/productos.service';
import { CartService } from '../../app/services/cart.service';

@Component({
  selector: 'app-catalogo-productos',
  standalone: true,
  templateUrl: './catalogo-productos.component.html',
  styleUrls: ['./catalogo-productos.component.css'],
  imports: [CommonModule]
})
export class CatalogoProductosComponent implements OnInit, OnDestroy {
  topProductos: any[] = [];
  loading = true;
  isLogged = false;
  isAdmin = false;

  paginaActual = 0;
  productosPorPagina = 2;
  intervalId: any = null;

  constructor(
    private productosService: ProductosService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isLogged = !!localStorage.getItem('token');
    this.isAdmin = (localStorage.getItem('login') === 'admin1');

    // Responsive: 1 producto por página en mobile, 2 en desktop/tablet
    this.setProductosPorPagina();
    window.addEventListener('resize', this.setProductosPorPagina);

    this.productosService.getTopProductos().subscribe({
      next: (res) => {
        this.topProductos = res;
        this.loading = false;
        this.startAutoScroll();
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
    window.removeEventListener('resize', this.setProductosPorPagina);
  }

  setProductosPorPagina = () => {
    if (window.innerWidth < 640) {
      this.productosPorPagina = 1;
    } else {
      this.productosPorPagina = 2;
    }
    // Reiniciar la página y auto scroll si cambia
    this.paginaActual = 0;
    this.stopAutoScroll();
    this.startAutoScroll();
  }

  get totalPaginas(): number {
    return Math.ceil(this.topProductos.length / this.productosPorPagina);
  }

  get productosCarrusel(): any[] {
    const inicio = this.paginaActual * this.productosPorPagina;
    return this.topProductos.slice(inicio, inicio + this.productosPorPagina);
  }

  anteriorPagina() {
    this.paginaActual = Math.max(0, this.paginaActual - 1);
    this.restartAutoScroll();
  }

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
    } else {
      this.paginaActual = 0; // Cicla al inicio
    }
    this.restartAutoScroll();
  }

  startAutoScroll() {
    if (this.intervalId) this.stopAutoScroll();
    this.intervalId = setInterval(() => {
      this.siguientePagina();
    }, 4000);
  }

  stopAutoScroll() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  restartAutoScroll() {
    this.stopAutoScroll();
    this.startAutoScroll();
  }

  agregarAlCarrito(producto: any) {
    this.cartService.addToCart(producto);
  }

  onImgError(event: any) {
    event.target.src = 'assets/img/no-image.png';
  }
}
