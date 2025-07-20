export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen_url: string;
  animal_id: number;
  disponible: boolean;
  fecha_ingreso: string;
  categoria?: string;
}
