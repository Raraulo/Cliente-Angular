import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Producto } from '../models/producto.model';
import { Categoria } from '../models/categoria.model';
import { Animal } from '../models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = 'http://127.0.0.1:4000/api/producto';
  private categoriaUrl = 'http://127.0.0.1:4000/api/categoria';
  private animalUrl = 'http://127.0.0.1:4000/api/animal';
  private masVendidosUrl = 'http://localhost:4000/api/catalogo/mas-vendidos'; // ← ENDPOINT PÚBLICO

  constructor(private http: HttpClient) {}

  /** Obtiene el token JWT desde el almacenamiento local */
  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  /** Genera los headers de autorización con JWT */
  private getAuthHeaders(): HttpHeaders {
    const token = this.obtenerToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** GET: Obtener todos los productos */
  getProductos(): Observable<Producto[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.Registro) // Extrae solo el array de productos
    );
  }

  /** GET: Obtener todas las categorías */
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.categoriaUrl);
  }

  /** GET: Obtener todos los tipos de animales */
  getAnimales(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.animalUrl);
  }

  /** GET: Productos más vendidos (PÚBLICO, lo ven todos) */
  getTopProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.masVendidosUrl);
  }

  /** POST: Crear nuevo producto (requiere token) */
  createProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto, {
      headers: this.getAuthHeaders()
    });
  }

  /** PUT: Actualizar producto (requiere token) */
  updateProducto(id: number, producto: Producto): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Producto>(url, producto, {
      headers: this.getAuthHeaders()
    });
  }

  /** DELETE: Eliminar producto (requiere token) */
  deleteProducto(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, {
      headers: this.getAuthHeaders()
    });
  }
}
