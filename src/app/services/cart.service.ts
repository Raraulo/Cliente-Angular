import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'carrito';
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items$.asObservable();

  readonly cartCount$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.cantidad, 0))
  );

  readonly subtotal$: Observable<number> = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0))
  );

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this._items$.next(JSON.parse(saved));
      } catch (e) {
        console.error('Error al leer el carrito guardado:', e);
      }
    }

    // Guardar automáticamente cuando cambie el carrito
    this._items$.subscribe(items => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    });
  }

  addToCart(producto: Producto) {
    const items = this._items$.value;
    const idx = items.findIndex(i => i.producto.id === producto.id);
    if (idx >= 0) {
      const id = producto.id!;
      this.updateQuantity(id, items[idx].cantidad + 1);
    } else {
      this._items$.next([...items, { producto, cantidad: 1 }]);
    }
  }

  updateQuantity(productoId: number, cantidad: number) {
    let items = this._items$.value;
    if (cantidad <= 0) {
      items = items.filter(i => i.producto.id !== productoId);
    } else {
      items = items.map(i =>
        i.producto.id === productoId ? { producto: i.producto, cantidad } : i
      );
    }
    this._items$.next(items);
  }

  removeFromCart(productoId: number) {
    this._items$.next(this._items$.value.filter(i => i.producto.id !== productoId));
  }

  clearCart() {
    this._items$.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
