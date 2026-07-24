import { Component, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  imports: [CommonModule, NgChartsModule, FormsModule, RouterModule],
})
export class ReportesComponent implements OnInit, AfterViewInit {
  // --- Datos de reportes ---
  topClientes: any[] = [];
  topProductos: any[] = [];
  stockDisponible: any[] = [];
  productosBajoStock: any[] = [];

  // --- Datos reportes globales ---
  valorTotalStock: number = 0;
  totalRecaudado: number = 0;
  totalProductosVendidos: number = 0;
  metaProductos: number = 200;

  // --- Facturas & Clientes ---
  personas: any[] = [];
  facturas: Array<any & { clienteNombre: string; clienteApellido: string }> = [];

  filtroCedula = '';
  filtroApellido = '';
  filtroNombreFactura: string = '';
  filtroApellidoFactura: string = '';

  personaEditando: any = null;
  formPersona: any = {
    nombre: '',
    apellido: '',
    login: '',
    mail: '',
    password: '',
    telefono: '',
    direccion: '',
    sexo: ''
  };
  mostrarPassword = false;

  get metaAvancePorc() {
    return Math.min((this.totalProductosVendidos / this.metaProductos) * 100, 100);
  }

  // --- Stock Disponible: línea paginada ---
  stockDisponibleLineaData = {
    labels: [] as string[],
    datasets: [{
      label: 'Stock Disponible',
      data: [] as number[],
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      fill: true,
      tension: 0.4
    }]
  };
  stockDisponibleLineaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const, labels: { color: '#94a3b8' } } },
    scales: {
      x: { title: { display: true, text: 'Producto', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { title: { display: true, text: 'Stock', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true }
    }
  };
  paginaStockDisponible = 0;
  productosPorPaginaStock = 10;
  totalPaginasStockDisponible = 0;

  // --- Top Clientes ---
  clientesBarData = {
    labels: [] as string[],
    datasets: [{
      label: 'Total Comprado ($)',
      data: [] as number[],
      backgroundColor: '#38bdf8',
      borderRadius: 8
    }]
  };
  clientesBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true }
    }
  };

  // --- Productos más vendidos ---
  vendidosDoughnutData = {
    labels: [] as string[],
    datasets: [{
      label: 'Vendidos',
      data: [] as number[],
      backgroundColor: [
        '#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171'
      ],
      borderWidth: 0
    }]
  };
  vendidosDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const, labels: { color: '#94a3b8' } } }
  };

  // --- Ventas por día ---
  ventasPorDiaLabels: string[] = [];
  ventasPorDiaData: number[] = [];
  ventasPorDiaLineData = {
    labels: [] as string[],
    datasets: [{
      label: 'Ventas por Día (2026)',
      data: [] as number[],
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129, 140, 248, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    }]
  };
  ventasPorDiaLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#94a3b8' } }
    },
    scales: {
      x: { title: { display: true, text: 'Fecha', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      y: { title: { display: true, text: 'Total Ventas (USD)', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true }
    }
  };

  token = localStorage.getItem('token') || '';
  login = localStorage.getItem('login') || '';

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    if (this.login !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarStockDisponible();
    this.cargarTopClientes();
    this.cargarTopProductos();
    this.cargarValorTotalStock();
    this.cargarTotalRecaudado();
    this.cargarTotalProductosVendidos();
    this.cargarVentasPorDia2026();
    this.cargarBajoStock();
    this.cargarPersonasYFacturas();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.forzarUpdateCharts();
    }, 400);
  }

  cargarPersonasYFacturas() {
    this.http.get<any>('https://servidor-go.onrender.com/api/user').pipe(
      tap(resp => this.personas = resp.Registro || []),
      switchMap(() => this.http.get<any>('https://servidor-go.onrender.com/api/factura'))
    ).subscribe({
      next: resp => {
        this.facturas = (resp.facturas || []).map((f: any) => {
          const p = this.personas.find(x => x.id === f.persona_id) || {};
          return {
            ...f,
            clienteNombre: p.nombre || '—',
            clienteApellido: p.apellido || ''
          };
        });
        // Si la API de top-clientes falla o viene vacía, calcular automáticamente desde las facturas cargadas
        if (this.clientesBarData.labels.length === 0) {
          this.calcularTopClientesDesdeFacturas();
        }
      },
      error: err => console.error('Error al cargar personas y facturas', err)
    });
  }

  get personasFiltradas() {
    return this.personas.filter(p => {
      const matchCedula = !this.filtroCedula || (p.cedula && p.cedula.toLowerCase().includes(this.filtroCedula.toLowerCase()));
      const matchApellido = !this.filtroApellido || (p.apellido && p.apellido.toLowerCase().includes(this.filtroApellido.toLowerCase()));
      return matchCedula && matchApellido;
    });
  }

  get facturasFiltradas() {
    return this.facturas.filter(f => {
      const matchNombre = !this.filtroNombreFactura || (f.clienteNombre && f.clienteNombre.toLowerCase().includes(this.filtroNombreFactura.toLowerCase()));
      const matchApellido = !this.filtroApellidoFactura || (f.clienteApellido && f.clienteApellido.toLowerCase().includes(this.filtroApellidoFactura.toLowerCase()));
      return matchNombre && matchApellido;
    });
  }

  abrirModalCrear() {
    this.personaEditando = null;
    this.formPersona = { nombre: '', apellido: '', login: '', mail: '', password: '', telefono: '', direccion: '', sexo: '' };
    const modal = document.getElementById('modal-persona');
    if (modal) modal.classList.remove('hidden');
  }

  abrirModalEditar(persona: any) {
    this.personaEditando = persona;
    this.formPersona = { ...persona };
    const modal = document.getElementById('modal-persona');
    if (modal) modal.classList.remove('hidden');
  }

  cerrarModal() {
    const modal = document.getElementById('modal-persona');
    if (modal) modal.classList.add('hidden');
  }

  guardarPersona() {
    if (this.personaEditando) {
      this.http.put(`https://servidor-go.onrender.com/api/user/${this.personaEditando.id}`, this.formPersona)
        .subscribe(() => {
          this.cargarPersonasYFacturas();
          this.cerrarModal();
        });
    } else {
      this.http.post('https://servidor-go.onrender.com/api/user', this.formPersona)
        .subscribe(() => {
          this.cargarPersonasYFacturas();
          this.cerrarModal();
        });
    }
  }

  eliminarPersona(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.http.delete(`https://servidor-go.onrender.com/api/user/${id}`)
        .subscribe(() => this.cargarPersonasYFacturas());
    }
  }

  // STOCK DISPONIBLE: línea paginada
  cargarStockDisponible() {
    this.http.get<any[]>('https://servidor-go.onrender.com/api/reportes/stock-disponible', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.stockDisponible = res;
      this.totalPaginasStockDisponible = Math.ceil(this.stockDisponible.length / this.productosPorPaginaStock);
      this.paginaStockDisponible = 0;
      this.actualizarGraficoStockDisponible();
      this.forzarUpdateCharts();
    });
  }

  actualizarGraficoStockDisponible() {
    const inicio = this.paginaStockDisponible * this.productosPorPaginaStock;
    const fin = inicio + this.productosPorPaginaStock;
    const productosPagina = this.stockDisponible.slice(inicio, fin);
    this.stockDisponibleLineaData.labels = productosPagina.map(p => p.nombre);
    this.stockDisponibleLineaData.datasets[0].data = productosPagina.map(p => p.stock);
    this.forzarUpdateCharts();
  }

  paginaAnteriorStockDisponible() {
    if (this.paginaStockDisponible > 0) {
      this.paginaStockDisponible--;
      this.actualizarGraficoStockDisponible();
    }
  }

  paginaSiguienteStockDisponible() {
    if (this.paginaStockDisponible < this.totalPaginasStockDisponible - 1) {
      this.paginaStockDisponible++;
      this.actualizarGraficoStockDisponible();
    }
  }

  cargarTopClientes() {
    this.http.get<any[]>('https://servidor-go.onrender.com/api/reportes/top-clientes', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe({
      next: res => {
        if (res && res.length > 0) {
          this.clientesBarData.labels = res.map(c => c.nombre || (c.clienteNombre ? `${c.clienteNombre} ${c.clienteApellido}` : 'Cliente'));
          this.clientesBarData.datasets[0].data = res.map(c => c.total_comprado || c.total);
          this.forzarUpdateCharts();
        } else {
          this.calcularTopClientesDesdeFacturas();
        }
      },
      error: () => {
        this.calcularTopClientesDesdeFacturas();
      }
    });
  }

  calcularTopClientesDesdeFacturas() {
    if (!this.facturas || this.facturas.length === 0) return;
    const totalesMap: { [nombre: string]: number } = {};

    this.facturas.forEach(f => {
      const nombreCompleto = `${f.clienteNombre} ${f.clienteApellido}`.trim() || 'Cliente';
      totalesMap[nombreCompleto] = (totalesMap[nombreCompleto] || 0) + (f.total || 0);
    });

    const ordenados = Object.entries(totalesMap)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    this.clientesBarData.labels = ordenados.map(c => c.nombre);
    this.clientesBarData.datasets[0].data = ordenados.map(c => c.total);
    this.forzarUpdateCharts();
  }

  cargarTopProductos() {
    this.http.get<any[]>('https://servidor-go.onrender.com/api/reportes/top-productos', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.vendidosDoughnutData.labels = res.map(p => p.nombre);
      this.vendidosDoughnutData.datasets[0].data = res.map(p => p.total_vendido);
      this.forzarUpdateCharts();
    });
  }

  cargarValorTotalStock() {
    this.http.get<any>('https://servidor-go.onrender.com/api/reportes/valor-stock', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.valorTotalStock = res.valor_total_stock ?? 0;
    });
  }

  cargarTotalRecaudado() {
    this.http.get<any>('https://servidor-go.onrender.com/api/reportes/total-recaudado', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.totalRecaudado = res.total_recaudado ?? 0;
    });
  }

  cargarTotalProductosVendidos() {
    this.http.get<any>('https://servidor-go.onrender.com/api/reportes/total-vendido', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.totalProductosVendidos = res.total_productos_vendidos ?? 0;
    });
  }

  cargarVentasPorDia2026() {
    this.http.get<any[]>('https://servidor-go.onrender.com/api/reportes/ventas-por-dia-2026', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.ventasPorDiaLabels = res.map(v => v.dia);
      this.ventasPorDiaData = res.map(v => v.total_ventas);
      this.ventasPorDiaLineData = {
        ...this.ventasPorDiaLineData,
        labels: [...this.ventasPorDiaLabels],
        datasets: [{
          ...this.ventasPorDiaLineData.datasets[0],
          data: [...this.ventasPorDiaData]
        }]
      };
      this.forzarUpdateCharts();
    });
  }

  cargarBajoStock() {
    this.http.get<any[]>('https://servidor-go.onrender.com/api/reportes/bajo-stock', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.productosBajoStock = res;
    });
  }

  forzarUpdateCharts() {
    setTimeout(() => {
      if (this.charts) {
        this.charts.forEach(chart => {
          if (chart && chart.chart) {
            chart.chart.resize();
            chart.chart.update();
          }
        });
      }
    }, 150);
  }
}
