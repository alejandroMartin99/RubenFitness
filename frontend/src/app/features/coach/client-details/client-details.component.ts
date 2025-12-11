import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoachService } from '../../../core/services/coach.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('workoutsChart') workoutsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('volumeChart') volumeChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('bodyCompChart') bodyCompChartCanvas!: ElementRef<HTMLCanvasElement>;

  userId!: string;
  loading = true;
  error: string | null = null;
  details: any = null;

  workoutsChart: Chart | null = null;
  volumeChart: Chart | null = null;
  bodyCompChart: Chart | null = null;

  expandedWorkouts = new Set<string>();
  validWorkouts: any[] = [];
  filteredWorkouts: any[] = [];
  workoutSummary: {
    week: { count: number; volume: number };
    month: { count: number; volume: number };
    weeklyBreakdown: Array<{ key: string; label: string; count: number; volume: number }>;
    monthlyBreakdown: Array<{ key: string; label: string; count: number; volume: number }>;
  } | null = null;
  workoutRange: '30' | '90' | 'all' = '30';

  private destroy$ = new Subject<void>();

  constructor(
    private coachService: CoachService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (params) => {
          const id = params['id'];
          if (!id) {
            this.error = 'ID de usuario no válido';
            this.loading = false;
            return;
          }
          
          // Si el ID cambió, destruir charts anteriores y cargar nuevos datos
          if (this.userId && this.userId !== id) {
            this.destroyCharts();
          }
          
          this.userId = id;
          this.loadDetails();
        },
        error: (err) => {
          console.error('Error in route params:', err);
          this.error = 'Error al obtener el ID del usuario';
          this.loading = false;
        }
      });
  }

  goBack(): void {
    try {
      this.router.navigate(['/coach']);
    } catch (error) {
      console.error('Error navigating back:', error);
      window.history.back();
    }
  }

  ngAfterViewInit(): void {
    // Charts will be created after data loads
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private isLoadingDetails = false;

  loadDetails(): void {
    // Prevenir múltiples llamadas simultáneas usando flag interno
    if (this.isLoadingDetails) {
      console.warn('loadDetails already in progress, skipping...');
      return;
    }

    this.isLoadingDetails = true;
    this.loading = true;
    this.error = null;

    if (!this.userId) {
      this.error = 'ID de usuario no válido';
      this.loading = false;
      this.isLoadingDetails = false;
      return;
    }

    // Destruir charts anteriores antes de cargar nuevos datos
    this.destroyCharts();

    console.log('Loading details for user:', this.userId);

    // Timeout de seguridad para evitar que se quede bloqueado
    const timeoutId = setTimeout(() => {
      if (this.isLoadingDetails) {
        console.error('Request timeout - loading took too long');
        this.error = 'La petición está tardando demasiado. Por favor, intenta de nuevo.';
        this.loading = false;
        this.isLoadingDetails = false;
      }
    }, 30000); // 30 segundos

    this.coachService.getUserDetails(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          clearTimeout(timeoutId);
          console.log('Details response received:', data);
          
          // El backend siempre devuelve success: true si es exitoso
          // Si no hay success o es false, es un error
          if (data && (data.success === true || data.success === undefined)) {
            // Si success es undefined pero hay datos, asumimos que es exitoso
            // Initialize empty arrays if they don't exist
            try {
              // Pre-procesar workouts para parsear las notas y evitar bucles infinitos
              const processedWorkouts = Array.isArray(data.workouts) 
                ? data.workouts.map((workout: any) => ({
                    ...workout,
                    parsedNotes: this.parseWorkoutNotes(workout.notes || ''),
                    formattedNotes: this.formatWorkoutNotes(workout.notes || '')
                  }))
                : [];

              this.details = {
                ...data,
                workouts: processedWorkouts,
                bodyComposition: Array.isArray(data.bodyComposition)
                  ? [...data.bodyComposition].sort((a, b) => {
                      const da = a.date ? new Date(a.date).getTime() : 0;
                      const db = b.date ? new Date(b.date).getTime() : 0;
                      return db - da; // más recientes primero
                    })
                  : [],
                photos: Array.isArray(data.photos) ? data.photos : [],
                achievements: Array.isArray(data.achievements) ? data.achievements : [],
                habits: Array.isArray(data.habits) ? data.habits : [],
                habitLogs: Array.isArray(data.habitLogs) ? data.habitLogs : [],
                healthData: Array.isArray(data.healthData) ? data.healthData : [],
                workoutDays: Array.isArray(data.workoutDays) ? data.workoutDays : [],
                streak: data.streak || {},
                profile: data.profile || {},
                user: data.user || {}
              };
              this.loading = false;
              this.isLoadingDetails = false;
              this.validWorkouts = this.getValidWorkouts().sort((a, b) => {
                const da = a.workout_date ? new Date(a.workout_date).getTime() : 0;
                const db = b.workout_date ? new Date(b.workout_date).getTime() : 0;
                return db - da;
              });
              this.applyWorkoutFilter();
              console.log('Details loaded successfully');
              
              // Esperar a que la vista se actualice antes de crear charts
              setTimeout(() => {
                if (!this.destroy$.closed) {
                  this.createCharts();
                }
              }, 200);
            } catch (e) {
              console.error('Error processing response data:', e);
              this.error = 'Error al procesar los datos recibidos';
              this.loading = false;
              this.isLoadingDetails = false;
            }
          } else {
            console.error('Error in response:', data);
            this.error = data?.error || data?.detail || 'Error al cargar los detalles';
            this.loading = false;
            this.isLoadingDetails = false;
          }
        },
        error: (err) => {
          clearTimeout(timeoutId);
          console.error('Error loading details:', err);
          this.error = err?.error?.detail || err?.error?.message || err?.message || 'Error al cargar los detalles del usuario';
          this.loading = false;
          this.isLoadingDetails = false;
        },
        complete: () => {
          clearTimeout(timeoutId);
          console.log('Request completed');
        }
      });
  }

  createCharts(): void {
    if (!this.details || this.destroy$.closed) return;

    // Destruir charts existentes antes de crear nuevos
    this.destroyCharts();

    // Workouts over time chart
    if (this.workoutsChartCanvas?.nativeElement && this.details.workouts && this.details.workouts.length > 0) {
      try {
        const workouts = this.details.workouts.slice().reverse();
        const labels = workouts.map((w: any) => {
          if (!w.workout_date) return '';
          const date = new Date(w.workout_date);
          if (isNaN(date.getTime())) return '';
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }).filter((l: string) => l !== '');
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Workouts',
            data: workouts.map(() => 1),
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
            legend: { display: false }
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
      
      if (labels.length > 0) {
        this.workoutsChart = new Chart(this.workoutsChartCanvas.nativeElement, config);
      }
      } catch (e) {
        console.error('Error creating workouts chart:', e);
      }
    }

    // Volume chart
    if (this.volumeChartCanvas?.nativeElement && this.details.workouts && this.details.workouts.length > 0) {
      try {
        const workouts = this.details.workouts.slice().reverse();
        const labels = workouts.map((w: any) => {
          if (!w.workout_date) return '';
          const date = new Date(w.workout_date);
          if (isNaN(date.getTime())) return '';
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }).filter((l: string) => l !== '');
      
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Volumen (kg)',
            data: workouts.map((w: any) => w.total_volume || 0),
            backgroundColor: 'rgba(246, 195, 67, 0.6)',
            borderColor: '#f6c343',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
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
      
      if (labels.length > 0) {
        this.volumeChart = new Chart(this.volumeChartCanvas.nativeElement, config);
      }
      } catch (e) {
        console.error('Error creating volume chart:', e);
      }
    }

    // Body composition chart
    if (this.bodyCompChartCanvas?.nativeElement && this.details.bodyComposition && this.details.bodyComposition.length > 0) {
      try {
        const comp = this.details.bodyComposition.slice().reverse();
        const labels = comp.map((c: any) => {
          if (!c.date) return '';
          const date = new Date(c.date);
          if (isNaN(date.getTime())) return '';
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }).filter((l: string) => l !== '');
      
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Peso (kg)',
              data: comp.map((c: any) => c.weight || null),
              borderColor: '#f6c343',
              backgroundColor: 'rgba(246, 195, 67, 0.1)',
              tension: 0.4,
              fill: false
            },
            {
              label: '% Grasa',
              data: comp.map((c: any) => c.fat || null),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: false
            },
            {
              label: 'Músculo (kg)',
              data: comp.map((c: any) => c.muscle || null),
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#9ca3af' }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
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
      
      if (labels.length > 0) {
        this.bodyCompChart = new Chart(this.bodyCompChartCanvas.nativeElement, config);
      }
      } catch (e) {
        console.error('Error creating body comp chart:', e);
      }
    }
  }

  destroyCharts(): void {
    try {
      if (this.workoutsChart) {
        this.workoutsChart.destroy();
        this.workoutsChart = null;
      }
      if (this.volumeChart) {
        this.volumeChart.destroy();
        this.volumeChart = null;
      }
      if (this.bodyCompChart) {
        this.bodyCompChart.destroy();
        this.bodyCompChart = null;
      }
    } catch (error) {
      console.error('Error destroying charts:', error);
      // Forzar limpieza en caso de error
      this.workoutsChart = null;
      this.volumeChart = null;
      this.bodyCompChart = null;
    }
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  }

  formatVolume(value: number): string {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  }

  formatWater(ml: number | null | undefined): string {
    if (ml === null || ml === undefined) return '-';
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)}L`;
    }
    return `${ml}ml`;
  }

  parseWorkoutNotes(notes: string): any {
    if (!notes) return null;
    
    try {
      // Limpiar el string: eliminar espacios extra, comillas al inicio/fin
      let cleaned = notes.trim();
      
      // Si empieza y termina con comillas, quitarlas
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      
      // Reemplazar saltos de línea escapados
      cleaned = cleaned.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\"/g, '"');
      
      // Si contiene "BODY_COMP:" es un registro de composición corporal, no un entrenamiento
      if (cleaned.includes('BODY_COMP:')) {
        return null; // Devolver null para que se muestre como texto plano
      }
      
      // Intentar extraer JSON embebido aunque haya texto alrededor
      const jsonMatch = cleaned.match(/{[\s\S]+}/);
      const jsonCandidate = jsonMatch ? jsonMatch[0] : cleaned;

      // Intentar parsear como JSON primero
      try {
        const parsed = JSON.parse(jsonCandidate);
        if (parsed && typeof parsed === 'object') {
          // Normalizar claves comunes
          if (parsed.workout_type && !parsed.type) {
            parsed.type = parsed.workout_type;
          }
          if (Array.isArray(parsed.exercises)) {
            parsed.exercises = parsed.exercises.map((ex: any) => ({
              name: ex?.name || '',
              sets: Array.isArray(ex?.sets)
                ? ex.sets.map((s: any) => ({
                    reps: Number(s?.reps || 0),
                    weight: Number(s?.weight || 0)
                  }))
                : []
            }));
          }
          return parsed;
        }
      } catch {
        // No es JSON válido, continuar con parsing manual
      }
      
      // Si no es JSON válido, intentar extraer información estructurada
      // Buscar patrones comunes como "Tipo: X", "Ejercicios: Y"
      const typeMatch = cleaned.match(/Tipo:\s*([^\n]+)/i);
      const exercisesMatch = cleaned.match(/Ejercicios:\s*(\d+)/i);
      
      if (typeMatch || exercisesMatch || cleaned.includes('---')) {
        const result: any = {};
        if (typeMatch) result.type = typeMatch[1].trim();
        if (exercisesMatch) result.exerciseCount = parseInt(exercisesMatch[1]);
        
        // Intentar extraer ejercicios si hay estructura con "---"
        const exerciseBlocks = cleaned.split(/---/);
        if (exerciseBlocks.length > 1) {
          result.exercises = [];
          exerciseBlocks.slice(1).forEach(block => {
            const lines = block.trim().split('\n').filter(l => l.trim());
            if (lines.length > 0) {
              // Buscar el nombre del ejercicio (primera línea que no sea "Datos" o "Serie")
              let exerciseName = '';
              let exerciseStartIdx = 0;
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line && !line.match(/^Datos|^Serie|^Serie\s+\d+/i)) {
                  exerciseName = line.replace(/^[-*]\s*/, '').trim();
                  exerciseStartIdx = i;
                  break;
                }
              }
              
              if (exerciseName) {
                const exercise: any = {
                  name: exerciseName,
                  sets: []
                };
                
                // Buscar series en las siguientes líneas
                lines.slice(exerciseStartIdx + 1).forEach(line => {
                  // Intentar parsear series: "Serie 1: 10 reps × 50 kg" o "10 reps × 50 kg"
                  const setMatch = line.match(/(?:Serie\s+\d+:\s*)?(\d+)\s*reps?\s*[×x]\s*(\d+(?:\.\d+)?)\s*kg/i);
                  if (setMatch) {
                    exercise.sets.push({
                      reps: parseInt(setMatch[1]),
                      weight: parseFloat(setMatch[2])
                    });
                  }
                });
                
                result.exercises.push(exercise);
              }
            }
          });
        }
        
        // Si tenemos al menos tipo o ejercicios, devolver el resultado
        if (result.type || result.exercises?.length > 0) {
          return result;
        }
      }
      
      // Si no se puede parsear, devolver null para que se muestre como texto plano
      return null;
    } catch {
      return null;
    }
  }

  getBodyCompEvolution(): any {
    if (!this.details?.bodyComposition || this.details.bodyComposition.length < 2) {
      return null;
    }
    
    const first = this.details.bodyComposition[this.details.bodyComposition.length - 1]; // Primera (más antigua)
    const last = this.details.bodyComposition[0]; // Última (más reciente)
    
    const evolution: any = {};
    
    if (first.weight && last.weight) {
      const diff = last.weight - first.weight;
      evolution.weight = {
        value: diff,
        percent: ((diff / first.weight) * 100).toFixed(1),
        isPositive: diff < 0 // Pérdida de peso es positiva
      };
    }
    
    if (first.fat && last.fat) {
      const diff = last.fat - first.fat;
      evolution.fat = {
        value: diff,
        percent: ((diff / first.fat) * 100).toFixed(1),
        isPositive: diff < 0 // Reducción de grasa es positiva
      };
    }
    
    if (first.muscle && last.muscle) {
      const diff = last.muscle - first.muscle;
      evolution.muscle = {
        value: diff,
        percent: ((diff / first.muscle) * 100).toFixed(1),
        isPositive: diff > 0 // Ganancia de músculo es positiva
      };
    }
    
    return Object.keys(evolution).length > 0 ? evolution : null;
  }

  formatWorkoutNotes(notes: string): string {
    if (!notes) return '';
    
    const parsed = this.parseWorkoutNotes(notes);
    
    if (!parsed) return notes;
    
    // Si es un objeto con estructura, formatearlo
    if (parsed.type || parsed.exercises) {
      let formatted = '';
      if (parsed.type) {
        formatted += `Tipo: ${parsed.type}\n`;
      }
      if (parsed.exercises && parsed.exercises.length > 0) {
        formatted += `Ejercicios: ${parsed.exercises.length}\n\n`;
        parsed.exercises.forEach((exercise: any, idx: number) => {
          formatted += `--- ${exercise.name || `Ejercicio ${idx + 1}`}\n`;
          if (exercise.sets && exercise.sets.length > 0) {
            exercise.sets.forEach((set: any, setIdx: number) => {
              formatted += `Serie ${setIdx + 1}: ${set.reps || 0} reps × ${set.weight || 0} kg\n`;
            });
          }
        });
      }
      return formatted.trim();
    }
    
    // Si tiene raw, devolverlo
    if (parsed.raw) {
      return parsed.raw;
    }
    
    return notes;
  }

  getValidWorkouts(): any[] {
    if (!this.details?.workouts) return [];
    return this.details.workouts.filter((workout: any) => {
      const type = workout.parsedNotes?.type || workout.workout_type;
      return !!type;
    });
  }

  private getISOWeek(date: Date): number {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil((((tmp as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  computeWorkoutSummary(workouts: any[]) {
    if (!workouts.length) return null;

    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let weekCount = 0;
    let weekVolume = 0;
    let monthCount = 0;
    let monthVolume = 0;

    const weeklyMap = new Map<string, { key: string; label: string; count: number; volume: number }>();
    const monthlyMap = new Map<string, { key: string; label: string; count: number; volume: number }>();

    workouts.forEach((workout: any) => {
      const date = workout.workout_date ? new Date(workout.workout_date) : null;
      if (!date || isNaN(date.getTime())) return;
      const volume = Number(workout.total_volume || 0);

      if (date >= weekStart) {
        weekCount += 1;
        weekVolume += volume;
      }

      if (date >= monthStart) {
        monthCount += 1;
        monthVolume += volume;
      }

      // Weekly breakdown
      const weekKey = `${date.getFullYear()}-W${this.getISOWeek(date)}`;
      const ws = this.getWeekStart(date);
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);
      const weekLabel = `${ws.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - ${we.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;

      const currentWeek = weeklyMap.get(weekKey) || { key: weekKey, label: weekLabel, count: 0, volume: 0 };
      currentWeek.count += 1;
      currentWeek.volume += volume;
      weeklyMap.set(weekKey, currentWeek);

      // Monthly breakdown
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      const currentMonth = monthlyMap.get(monthKey) || { key: monthKey, label: monthLabel, count: 0, volume: 0 };
      currentMonth.count += 1;
      currentMonth.volume += volume;
      monthlyMap.set(monthKey, currentMonth);
    });

    const weeklyBreakdown = Array.from(weeklyMap.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
    const monthlyBreakdown = Array.from(monthlyMap.values()).sort((a, b) => (a.key < b.key ? 1 : -1));

    return {
      week: { count: weekCount, volume: weekVolume },
      month: { count: monthCount, volume: monthVolume },
      weeklyBreakdown,
      monthlyBreakdown
    };
  }

  toggleWorkout(workout: any, index: number): void {
    const key = this.getWorkoutKey(workout, index);
    if (this.expandedWorkouts.has(key)) {
      this.expandedWorkouts.delete(key);
    } else {
      this.expandedWorkouts.add(key);
    }
  }

  onWorkoutRangeChange(value: '30' | '90' | 'all'): void {
    this.workoutRange = value;
    this.applyWorkoutFilter();
  }

  private applyWorkoutFilter(): void {
    const now = new Date();
    let filtered = this.validWorkouts;

    if (this.workoutRange === '30') {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      filtered = this.validWorkouts.filter(w => {
        const d = w.workout_date ? new Date(w.workout_date) : null;
        return d && !isNaN(d.getTime()) && d >= from;
      });
    } else if (this.workoutRange === '90') {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      filtered = this.validWorkouts.filter(w => {
        const d = w.workout_date ? new Date(w.workout_date) : null;
        return d && !isNaN(d.getTime()) && d >= from;
      });
    }

    this.filteredWorkouts = filtered;
    this.workoutSummary = this.computeWorkoutSummary(filtered);
  }

  isWorkoutExpanded(workout: any, index: number): boolean {
    return this.expandedWorkouts.has(this.getWorkoutKey(workout, index));
  }

  private getWorkoutKey(workout: any, index: number): string {
    return workout.id || `${workout.workout_date || 'workout'}-${index}`;
  }

  openWhatsApp(phone: string, name: string): void {
    try {
      if (!phone || !name) {
        console.warn('Missing phone or name for WhatsApp');
        return;
      }
      this.coachService.openWhatsApp(phone, name);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  }

  getHabitLogs(habitId: string): any[] {
    if (!this.details?.habitLogs) return [];
    return this.details.habitLogs.filter((log: any) => log.habit_id === habitId || log.habits?.id === habitId);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}

