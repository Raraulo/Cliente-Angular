// src/app/services/factura.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura } from '../models/factura.models';

interface FacturasResponse {
  ok: boolean;
  facturas: Factura[];
  persona: number;
  usuario: string;
}

interface FacturaResponse {
  ok: boolean;
  factura: Factura & {
    detalle: Array<{
      producto_nombre: string;
      cantidad: number;
      precio_unitario: number;
      imagen: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  /** Trae las facturas del usuario autenticado, incluyendo detalle */
  getFacturasDelUsuario(): Observable<FacturasResponse> {
    return this.http.get<FacturasResponse>(
      `${this.apiUrl}/factura/mias`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Finaliza la compra: crea factura con detalle y actualiza stock.
   * Usa el mismo payload que tu endpoint /factura/compra espera.
   */
  finalizarCompra(payload: {
    persona_id: number;
    metodo_pago: string;
    detalles: { producto_id: number; cantidad: number }[];
  }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/factura/compra`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtiene una única factura por su ID (con detalle)
   */
  getFactura(id: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(
      `${this.apiUrl}/factura/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /** Construye los headers con el token Bearer si existe */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}
