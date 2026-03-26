import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Bicicleta, Proveedor, Compra, DetalleCompra,
  Venta, DetalleVenta, PaginatedResponse
} from '../models/models';

// Interfaces específicas del admin
export interface DashboardMetrics {
  ventasHoy: number;
  ingresosHoy: number;
  totalBicicletas: number;
  stockBajo: number;       // cuántas bicicletas están bajo stock mínimo
  ventasSemana: number;
  ingresosSemana: number;
}

export interface VentaDetallada {
  id_venta: number;
  fecha: string;
  total: number;
  id_cliente?: number;
  cliente_nombre?: string;
  detalles?: DetalleVenta[];
}

export interface CompraDetallada {
  id_compra: number;
  fecha: string;
  total: number;
  id_proveedor?: number;
  proveedor_nombre?: string;
  detalles?: DetalleCompra[];
}

export interface NuevaBicicleta {
  sku: string; marca: string; modelo: string;
  tipo: string; precio: number;
  stock_actual: number; stock_minimo: number;
  descripcion?: string;
}

export interface NuevaCompra {
  id_proveedor: number;
  total: number;
  detalles: { id_bicicleta: number; cantidad: number; precio_unitario: number; subtotal: number }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api  = environment.apiUrl;

  // ---- Dashboard ----
  getDashboard(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.api}/admin/dashboard`);
  }

  // ---- Bicicletas ----
  getBicicletas(): Observable<PaginatedResponse<Bicicleta>> {
    return this.http.get<PaginatedResponse<Bicicleta>>(`${this.api}/bicicletas`);
  }
  createBicicleta(data: NuevaBicicleta): Observable<Bicicleta> {
    return this.http.post<Bicicleta>(`${this.api}/bicicletas`, data);
  }
  updateBicicleta(id: number, data: NuevaBicicleta): Observable<Bicicleta> {
    return this.http.put<Bicicleta>(`${this.api}/bicicletas/${id}`, data);
  }
  deleteBicicleta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/bicicletas/${id}`);
  }

  // ---- Ventas ----
  getVentas(fechaInicio?: string, fechaFin?: string): Observable<VentaDetallada[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin)    params = params.set('fechaFin', fechaFin);
    return this.http.get<VentaDetallada[]>(`${this.api}/ventas`, { params });
  }

  // ---- Compras ----
  getCompras(): Observable<CompraDetallada[]> {
    return this.http.get<CompraDetallada[]>(`${this.api}/compras`);
  }
  createCompra(data: NuevaCompra): Observable<Compra> {
    return this.http.post<Compra>(`${this.api}/compras`, data);
  }

  // ---- Proveedores ----
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.api}/proveedores`);
  }
  createProveedor(data: Omit<Proveedor, 'id_proveedor'>): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.api}/proveedores`, data);
  }
  updateProveedor(id: number, data: Omit<Proveedor, 'id_proveedor'>): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.api}/proveedores/${id}`, data);
  }
  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/proveedores/${id}`);
  }
}