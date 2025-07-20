import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  // ------------- LOGIN ----------------
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // ------------- PERFIL ----------------
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
  },

  // ------------- SECCIONES -------------
  {
    path: 'perros',
    loadComponent: () =>
      import('./pages/perros/perros.component').then(m => m.PerrosComponent)
  },
  {
    path: 'gatos',
    loadComponent: () =>
      import('./pages/gatos/gatos.component').then(m => m.GatosComponent)
  },
  {
    path: 'peces',
    loadComponent: () =>
      import('./pages/peces/peces.component').then(m => m.PecesComponent)
  },
  {
    path: 'aves',
    loadComponent: () =>
      import('./pages/aves/aves.component').then(m => m.AvesComponent)
  },
  {
    path: 'pequenos',
    loadComponent: () =>
      import('./pages/pequenos/pequenos.component').then(m => m.PequenosComponent)
  },
  {
    path: 'granja',
    loadComponent: () =>
      import('./pages/granja/granja.component').then(m => m.GranjaComponent)
  },

  // ------------- MEDICINA -----------------
  {
    path: 'medicin',
    loadComponent: () =>
      import('./pages/medicin/medicin.component').then(m => m.MedicinaComponent)
  },

  // ------------- USUARIO - COMPRAS -----------------
  {
    path: 'usuario/finalizar-compra',
    loadComponent: () =>
      import('./pages/usuario/finalizar-compra/finalizar-compra.component').then(m => m.FinalizarCompraComponent)
  },
  {
    path: 'usuario/mis-compras',
    loadComponent: () =>
      import('./pages/usuario/mis-compras/mis-compras.component').then(m => m.MisComprasComponent)
  },

  // ------------- ADMINISTRACIÓN -----------------
  {
    path: 'admin/productos',
    loadComponent: () =>
      import('./pages/admin/productos.component').then(m => m.ProductosComponent)
  },
  {
    path: 'admin/facturas',
    loadComponent: () =>
      import('./pages/admin/admin-facturas.component').then(m => m.AdminFacturasComponent)
  },
  {
    path: 'admin/facturas/:id',
    loadComponent: () =>
      import('./pages/admin/detalle-factura-admin.component').then(m => m.DetalleFacturaAdminComponent)
  },
  {
    path: 'admin/reportes',
    loadComponent: () =>
      import('./pages/admin/reportes.component').then(m => m.ReportesComponent)
  },

  // ------------- RUTA POR DEFECTO -------------------
  { path: '**', redirectTo: '' }
];
