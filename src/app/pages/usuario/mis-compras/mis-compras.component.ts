// src/app/pages/usuario/mis-compras/mis-compras.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from '../../../services/factura.service';
import { Factura, FacturaDetalle } from '../../../models/factura.models';

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
          return { ...f, subtotal, iva, showDetalle: false };
        });
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  toggleDetalle(item: any): void {
    item.showDetalle = !item.showDetalle;
    if (item.showDetalle) {
      setTimeout(() => {
        const el = document.getElementById(`factura-${item.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  descargarFactura(factura: any): void {
    // Generación de HTML para el PDF de la factura
    const subtotal = factura.subtotal ?? +(factura.total / 1.15).toFixed(2);
    const iva = factura.iva ?? +(factura.total - subtotal).toFixed(2);
    const fecha = new Date(factura.fecha).toLocaleDateString('es-EC', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const lineasDetalle = (factura.detalle || []).map((d: FacturaDetalle) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;">${d.producto_nombre}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${d.cantidad}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${d.precio_unitario.toFixed(2)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">$${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Comprobante de Compra #${factura.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, 'Inter', sans-serif; color: #0f172a; background: #fff; padding: 48px; max-width: 720px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #0f172a; margin-bottom: 32px; }
    .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
    .brand span { color: #0284c7; }
    .meta { text-align: right; font-size: 13px; color: #64748b; }
    .meta strong { font-size: 18px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 4px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .info-box label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 6px; }
    .info-box p { font-size: 14px; font-weight: 600; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead th { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #64748b; padding: 12px 8px; border-bottom: 2px solid #0f172a; text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 13px; padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9; }
    .totals-row.total { font-size: 18px; font-weight: 800; color: #0f172a; border-bottom: none; padding-top: 16px; margin-top: 8px; }
    .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #94a3b8; }
    .badge { display: inline-block; background: #0284c7; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Paw<span>Luxury</span></div>
      <p style="font-size:12px;color:#94a3b8;margin-top:4px;">Comprobante de Compra</p>
    </div>
    <div class="meta">
      <strong>Orden #${factura.id}</strong>
      ${fecha}<br/>
      <span class="badge" style="margin-top:8px;display:inline-block;">${factura.metodo_pago}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <label>Fecha de emisión</label>
      <p>${fecha}</p>
    </div>
    <div class="info-box">
      <label>Número de orden</label>
      <p>#${factura.id}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Cant.</th>
        <th>P. Unitario</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>${lineasDetalle}</tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="totals-row">
      <span>IVA (15%)</span>
      <span>$${iva.toFixed(2)}</span>
    </div>
    <div class="totals-row total">
      <span>Total</span>
      <span style="color:#059669;">$${factura.total.toFixed(2)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Gracias por tu compra. Para consultas escríbenos a soporte@pawluxury.ec</p>
    <p style="margin-top:8px;">PawLuxury &mdash; Documento generado el ${new Date().toLocaleDateString('es-EC')}</p>
  </div>
</body>
</html>`;

    // Abrir en nueva ventana e invocar print (genera PDF nativo del navegador)
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => ventana.print(), 400);
    }
  }
}
