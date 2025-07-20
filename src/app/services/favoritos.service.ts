// src/app/services/favoritos.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private _items$ = new BehaviorSubject<Producto[]>([]);
  readonly items$ = this._items$.asObservable();
  readonly favCount$: Observable<number> = this.items$.pipe(map(a => a.length));

  addToFavorites(producto: Producto) {
    const current = this._items$.value;
    if (!current.find(p => p.id === producto.id)) {
      this._items$.next([...current, producto]);
    }
  }

  removeFromFavorites(productoId: number) {
    this._items$.next(this._items$.value.filter(p => p.id !== productoId));
  }
}
