export interface Persona {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  mail: string;
  telefono: string;
  sexo: string;
  direccion: string;
}

export interface FacturaDetalle {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  producto_nombre: string;
  imagen: string;
  activo: boolean;
}

export interface Factura {
  id: number;
  persona_id: number;
  fecha: string;
  total: number;
  metodo_pago: string;
  detalle: FacturaDetalle[];
  persona: Persona; // ✅ Agregado para mostrar nombre y apellido
}
