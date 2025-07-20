import { Component, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  imports: [CommonModule, NgChartsModule],
})
export class ReportesComponent implements OnInit, AfterViewInit {
  // --- Datos de reportes ---
  topClientes: any[] = [];
  topProductos: any[] = [];
  stockDisponible: any[] = [];
  productosBajoStock: any[] = [];    // <--- NUEVO

  // --- Nuevos datos reportes globales ---
  valorTotalStock: number = 0;
  totalRecaudado: number = 0;
  totalProductosVendidos: number = 0;
  metaProductos: number = 200;

  // Para barra de progreso meta
  get metaAvancePorc() {
    return Math.min((this.totalProductosVendidos / this.metaProductos) * 100, 100);
  }

  // --- 1. Stock Disponible: línea con paginador ---
  stockDisponibleLineaData = {
    labels: [] as string[],
    datasets: [{
      label: 'Stock Disponible',
      data: [] as number[],
      borderColor: '#34d399',
      backgroundColor: 'rgba(52,211,153,0.2)',
      fill: true,
      tension: 0.4
    }]
  };
  stockDisponibleLineaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      x: { title: { display: true, text: 'Producto' } },
      y: { title: { display: true, text: 'Stock' }, beginAtZero: true }
    }
  };
  paginaStockDisponible = 0;
  productosPorPaginaStock = 10;
  totalPaginasStockDisponible = 0;

  // --- 2. Top Clientes (barras verticales) ---
  clientesBarData = {
    labels: [] as string[],
    datasets: [{
      label: 'Total Comprado',
      data: [] as number[],
      backgroundColor: '#a78bfa'
    }]
  };
  clientesBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  // --- 3. Productos más vendidos (dona) ---
  vendidosDoughnutData = {
    labels: [] as string[],
    datasets: [{
      label: 'Vendidos',
      data: [] as number[],
      backgroundColor: [
        '#818cf8','#fbbf24','#a3e635','#f87171','#34d399'
      ]
    }]
  };
  vendidosDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } }
  };

  // --- 4. Diagrama de línea: Ventas por día 2025 ---
  ventasPorDiaLabels: string[] = [];
  ventasPorDiaData: number[] = [];
  ventasPorDiaLineData = {
    labels: [] as string[],
    datasets: [{
      label: 'Ventas por Día (2025)',
      data: [] as number[],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      fill: true,
      tension: 0.35,
      pointRadius: 2,
    }]
  };
  ventasPorDiaLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const }
    },
    scales: {
      x: { title: { display: true, text: 'Fecha' } },
      y: { title: { display: true, text: 'Total Ventas (USD)' }, beginAtZero: true }
    }
  };

  token = localStorage.getItem('token') || '';
  login = localStorage.getItem('login') || '';

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (this.login !== 'admin1') {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarStockDisponible();
    this.cargarTopClientes();
    this.cargarTopProductos();
    this.cargarValorTotalStock();
    this.cargarTotalRecaudado();
    this.cargarTotalProductosVendidos();
    this.cargarVentasPorDia2025();
    this.cargarBajoStock();   // <--- Cargar bajo stock al iniciar
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.forzarUpdateCharts();
    }, 400);
  }

  // STOCK DISPONIBLE: línea paginada
  cargarStockDisponible() {
    this.http.get<any[]>('http://localhost:4000/api/reportes/stock-disponible', {
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

  // TOP CLIENTES (barras)
  cargarTopClientes() {
    this.http.get<any[]>('http://localhost:4000/api/reportes/top-clientes', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.topClientes = res;
      this.clientesBarData.labels = res.map(c => c.prsnnmbr);
      this.clientesBarData.datasets[0].data = res.map(c => c.total_comprado);
      this.forzarUpdateCharts();
    });
  }

  // PRODUCTOS MÁS VENDIDOS (doughnut)
  cargarTopProductos() {
    this.http.get<any[]>('http://localhost:4000/api/reportes/top-productos', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.topProductos = res;
      this.vendidosDoughnutData.labels = res.map(p => p.nombre);
      this.vendidosDoughnutData.datasets[0].data = res.map(p => p.total_vendido);
      this.forzarUpdateCharts();
    });
  }

  // --- NUEVOS MÉTODOS DE REPORTE GLOBAL ---
  cargarValorTotalStock() {
    this.http.get<any>('http://localhost:4000/api/reportes/valor-stock', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.valorTotalStock = res.valor_total_stock ?? 0;
    });
  }

  cargarTotalRecaudado() {
    this.http.get<any>('http://localhost:4000/api/reportes/total-recaudado', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.totalRecaudado = res.total_recaudado ?? 0;
    });
  }

  cargarTotalProductosVendidos() {
    this.http.get<any>('http://localhost:4000/api/reportes/total-vendido', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.totalProductosVendidos = res.total_productos_vendidos ?? 0;
    });
  }

  // --- NUEVO: Cargar ventas por día (2025) ---
  cargarVentasPorDia2025() {
    this.http.get<any[]>('http://localhost:4000/api/reportes/ventas-por-dia-2025', {
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

  // --- NUEVO: Cargar productos bajo stock ---
  cargarBajoStock() {
    this.http.get<any[]>('http://localhost:4000/api/reportes/bajo-stock', {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.token}` })
    }).subscribe(res => {
      this.productosBajoStock = res;
    });
  }

  // Método para forzar update de todos los charts
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
