// src/app/core/models/models.ts
import { Observable } from 'rxjs';

export interface Bicicleta {
  id_bicicleta: number;
  sku: string;
  marca: string;
  modelo: string;
  tipo: 'Mountain' | 'Road' | 'Electric' | 'Gear';
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  descripcion?: string;
  imagenes?: string[];
  especificaciones?: Record<string, string>;
  etiqueta?: 'NEW ARRIVAL' | 'LUXURY TIER' | null;
}

export interface Proveedor {
  id_proveedor: number;
  nombre_empresa: string;
  persona_contacto: string;
  telefono_contacto: string;
  email_contacto: string;
}

export interface Cliente {
  id_cliente: number;
  documento: string;
  nombre: string;
  telefono: string;
  rol?: 'CLIENTE' | 'ADMIN';
}

export interface Venta {
  id_venta: number;
  fecha: string;
  total: number;
  id_cliente: number;
}

export interface DetalleVenta {
  id_detalle: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  id_venta: number;
  id_bicicleta: number;
  bicicleta?: Bicicleta;
}

export interface Compra {
  id_compra: number;
  fecha: string;
  total: number;
  id_proveedor: number;
  proveedor?: Proveedor;
}

export interface DetalleCompra {
  id_detalle_compra: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  id_compra: number;
  id_bicicleta: number;
  bicicleta?: Bicicleta;
}

// ---- Auth ----
export interface LoginRequest    { email: string; password: string; }
export interface RegisterRequest {
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  password: string;
}
export interface AuthResponse    { token: string; cliente: Cliente; }

// ---- Cart ----
export interface CartItem {
  bicicleta: Bicicleta;
  cantidad: number;
  talla?: string;
  color?: string;
}

// ---- Filtros ----
export interface BikeFilters {
  tipo?: string;
  marca?: string;
  precioMin?: number;
  precioMax?: number;
  busqueda?: string;
}

// ---- Paginación ----
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}