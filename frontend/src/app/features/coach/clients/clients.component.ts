import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CoachService, ClientKpi, ClientRow, AdminDashboardData } from '../../../core/services/coach.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('evolutionChart') evolutionChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersChart') usersChartCanvas!: ElementRef<HTMLCanvasElement>;

  search = '';
  loading = true;
  error: string | null = null;
  Math = Math; // Expose Math to template

  kpis: ClientKpi[] = [];
  clients: ClientRow[] = [];
  evolutionData: AdminDashboardData['evolution'] = [];

  evolutionChart: Chart | null = null;
  volumeChart: Chart | null = null;
  usersChart: Chart | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private coachService: CoachService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.coachService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.kpis = this.coachService.formatKpis(data.kpis);
          this.clients = data.clients;
          this.evolutionData = data.evolution;
          this.loading = false;
          
          // Create charts after data loads
          setTimeout(() => {
            this.createCharts();
          }, 100);
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.error = 'Error al cargar los datos. Por favor, intenta de nuevo.';
          this.loading = false;
          
          // Fallback to empty state
          this.kpis = [
            { label: 'Usuarios activos', value: '0', trendType: 'neutral' },
            { label: 'Workouts esta semana', value: '0', trendType: 'neutral' },
            { label: 'Volumen total', value: '0 kg', trendType: 'neutral' },
            { label: 'Racha media', value: '0 días', trendType: 'neutral' }
          ];
          this.clients = [];
          this.evolutionData = [];
        }
      });
  }

  createCharts(): void {
    this.destroyCharts();
    
    if (this.evolutionData.length === 0) return;

    // Evolution Chart - Workouts over time
    if (this.evolutionChartCanvas) {
      const labels = this.evolutionData.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Workouts',
            data: this.evolutionData.map(d => d.workouts),
            borderColor: '#f6c343',
            backgroundColor: 'rgba(246, 195, 67, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            }
          }
        }
      };
      
      this.evolutionChart = new Chart(this.evolutionChartCanvas.nativeElement, config);
    }

    // Volume Chart
    if (this.volumeChartCanvas) {
      const labels = this.evolutionData.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Volumen (kg)',
            data: this.evolutionData.map(d => d.volume),
            backgroundColor: 'rgba(246, 195, 67, 0.6)',
            borderColor: '#f6c343',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            }
          }
        }
      };
      
      this.volumeChart = new Chart(this.volumeChartCanvas.nativeElement, config);
    }

    // Active Users Chart
    if (this.usersChartCanvas) {
      const labels = this.evolutionData.map(d => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Usuarios activos',
            data: this.evolutionData.map(d => d.activeUsers),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: '#1f1f24' }
            }
          }
        }
      };
      
      this.usersChart = new Chart(this.usersChartCanvas.nativeElement, config);
    }
  }

  destroyCharts(): void {
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
      this.evolutionChart = null;
    }
    if (this.volumeChart) {
      this.volumeChart.destroy();
      this.volumeChart = null;
    }
    if (this.usersChart) {
      this.usersChart.destroy();
      this.usersChart = null;
    }
  }

  get filteredClients(): ClientRow[] {
    const term = this.search.toLowerCase().trim();
    if (!term) return this.clients;
    return this.clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.goals.some(g => g.toLowerCase().includes(term))
    );
  }

  get activeClients(): ClientRow[] {
    return this.filteredClients.filter(c =>
      (c.workoutsWeek && c.workoutsWeek > 0) ||
      (c.volumeWeek && c.volumeWeek > 0) ||
      (c.lastWorkout && c.lastWorkout.toLowerCase() !== 'sin entrenos')
    );
  }

  get missingActivityClients(): ClientRow[] {
    return this.filteredClients.filter(c =>
      !this.activeClients.includes(c) &&
      c.streak === 0 &&
      (!c.volumeWeek || c.volumeWeek === 0) &&
      (!c.workoutsWeek || c.workoutsWeek === 0) &&
      (!c.lastWorkout || c.lastWorkout.toLowerCase() === 'sin entrenos')
    );
  }

  get bodyCompClients(): ClientRow[] {
    return this.filteredClients.filter(c =>
      (c.weight !== null && c.weight !== undefined) ||
      (c.fat !== null && c.fat !== undefined) ||
      (c.muscle !== null && c.muscle !== undefined)
    );
  }

  get missingBodyCompClients(): ClientRow[] {
    return this.filteredClients.filter(c =>
      !this.bodyCompClients.includes(c)
    );
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  }

  formatPhone(phone?: string | null): string {
    if (!phone) return '';
    // Eliminar todo menos dígitos y +
    const clean = phone.replace(/[^\d+]/g, '');
    if (!clean) return '';
    // Si no empieza por +, asumimos +34
    const normalized = clean.startsWith('+') ? clean : `+34${clean}`;
    // Formateo ligero para lectura: +34 600 000 000
    const digits = normalized.replace(/\D/g, '');
    if (digits.length >= 11) {
      const cc = digits.slice(0, 2);
      const rest = digits.slice(2);
      return `+${cc} ${rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim()}`;
    }
    return normalized;
  }

  formatVolume(value: number): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  }

  openWhatsApp(client: ClientRow): void {
    this.coachService.openWhatsApp(client.phone || '', client.name);
  }

  openCalendar(client: ClientRow): void {
    if (!client.phone) {
      alert('Añade un teléfono para agendar la cita');
      return;
    }
    const title = encodeURIComponent(`Cita con ${client.name || 'cliente'}`);
    const details = encodeURIComponent(`Teléfono: ${this.formatPhone(client.phone)}`);
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${title}&details=${details}`;
    window.open(url, '_blank');
  }

  openEmail(client: ClientRow): void {
    const subject = encodeURIComponent('Completa tus datos en Rubén Fitness');
    const body = encodeURIComponent(
      `Hola ${client.name || ''},\n\n` +
      `¿Puedes completar tus datos (entrenos/composición) para seguir tu progreso?\n\n` +
      `Gracias,\nRubén Fitness`
    );
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  }

  viewClientDetails(client: ClientRow): void {
    // Navigate to dedicated details page
    this.router.navigate(['/coach/client', client.id]);
  }
}
