import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, map } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { CartService, CartItem } from '../../services/cart.service';
import { FavoritosService } from '../../services/favoritos.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  user$!: Observable<string | null>;
  cartCount$!: Observable<number>;
  favCount$!: Observable<number>;
  cartItems$!: Observable<CartItem[]>;
  subtotal$!: Observable<number>;
  cartOpen = false;
  
  // Hamburger menu state and animation control
  menuOpen = false;
  menuAnimating = false;

  readonly IVA = 0.15; // 15%

  constructor(
    private auth: AuthService,
    public cart: CartService,
    public fav: FavoritosService,
    private router: Router
  ) {
    this.user$ = this.auth.user$;
    this.cartCount$ = this.cart.cartCount$;
    this.favCount$ = this.fav.favCount$;
    this.cartItems$ = this.cart.items$;

    // Subtotal calculado SIN IVA
    this.subtotal$ = this.cart.items$.pipe(
      map(items =>
        items.reduce((acc, item) => {
          const precioSinIva = item.producto.precio / (1 + this.IVA);
          return acc + precioSinIva * item.cantidad;
        }, 0)
      )
    );
  }

  logout() {
    this.auth.logout();
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
    if (this.cartOpen && this.menuOpen) {
      this.closeMenu();
    }
  }

  // ------- Menú hamburguesa animado --------

  openMenu() {
    this.menuAnimating = true;
    setTimeout(() => this.menuOpen = true, 10);
    document.body.style.overflow = 'hidden'; // Bloquea scroll al abrir menú
  }

  closeMenu() {
    this.menuOpen = false;
    setTimeout(() => {
      this.menuAnimating = false;
      document.body.style.overflow = ''; // Restaura scroll
    }, 300); // Debe coincidir con la duración de la transición
  }

  // Manejar fin de transición por seguridad (opcional)
  onMenuTransitionEnd() {
    if (!this.menuOpen) {
      this.menuAnimating = false;
      document.body.style.overflow = '';
    }
  }

  // Para links del menú
  goToSection(path: string) {
    this.router.navigate([path]);
    this.closeMenu();
  }

  inc(item: CartItem) {
    const id = item.producto.id!;
    this.cart.updateQuantity(id, item.cantidad + 1);
  }

  dec(item: CartItem) {
    const id = item.producto.id!;
    if (item.cantidad > 1) {
      this.cart.updateQuantity(id, item.cantidad - 1);
    }
  }

  remove(item: CartItem) {
    const id = item.producto.id!;
    this.cart.removeFromCart(id);
  }

  finalizarCompra() {
    this.cartOpen = false;
    this.router.navigate(['/usuario/finalizar-compra']);
  }

  precioSinIva(precioConIva: number): number {
    return +(precioConIva / (1 + this.IVA)).toFixed(2);
  }

  calcularIva(precioConIva: number): number {
    const sinIva = this.precioSinIva(precioConIva);
    return +(precioConIva - sinIva).toFixed(2);
  }

  calcularTotal(subtotal: number): number {
    return +(subtotal * (1 + this.IVA)).toFixed(2);
  }
}
