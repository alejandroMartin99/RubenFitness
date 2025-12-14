import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgressService } from '../../../core/services/progress.service';
import { ProgressSummary, ProgressStats } from '../../../core/models/progress.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  summary: ProgressSummary | null = null;
  stats: ProgressStats | null = null;
  loading = false;

  workoutForm: FormGroup;
  workoutTypes = [
    'Espalda - Bíceps',
    'Pecho - Tríceps',
    'Pierna',
    'Hombro - Brazo'
  ];

  history: {
    date: string;
    type: string;
    exercises: number;
    volume: number;
  }[] = [];

  bodyComp = {
    muscle: 34.5,
    fat: 18.2,
    weight: 72.4
  };

  bodyCompHistory: { date: string; muscle: number; fat: number; weight: number }[] = [
    // initially empty; will load from backend
  ];

  bodyCompForm: FormGroup;

  private muscleChart?: Chart;
  private fatChart?: Chart;
  private weightChart?: Chart;

  // GIFs animados de ejercicios - archivos locales en assets/exercises/
  private readonly GIF_PATH = 'assets/exercises/';
  
  exerciseImages: Record<string, string> = {
    // ESPALDA - BÍCEPS
    'Dominadas': 'pull-up.gif',
    'Jalón al Pecho': 'lat-pulldown.gif',
    'Jalón Agarre Cerrado': 'lat-pulldown.gif',
    'Remo con Barra': 'barbell-bent-over-row.gif',
    'Remo con Mancuerna': 'dumbbell-row.gif',
    'Remo en Polea Baja': 'seated-cable-row.gif',
    'Remo en Máquina': 'seated-cable-row.gif',
    'Peso Muerto': 'barbell-deadlift.gif',
    'Hiperextensiones': 'hyperextension.gif',
    'Face Pull': 'face-pull.gif',
    'Pullover': 'dumbbell-pullover.gif',
    'Curl con Barra': 'barbell-curl.gif',
    'Curl con Mancuernas': 'dumbbell-curl.gif',
    'Curl Martillo': 'hammer-curl.gif',
    'Curl Concentrado': 'concentration-curl.gif',
    'Curl en Banco Scott': 'barbell-curl.gif',
    'Curl en Polea': 'barbell-curl.gif',
    'Curl Inclinado': 'dumbbell-curl.gif',
    'Curl Spider': 'concentration-curl.gif',
    'Encogimientos': 'barbell-shrug.gif',
    // PECHO - TRÍCEPS
    'Press Banca': 'barbell-bench-press.gif',
    'Press Banca Inclinado': 'incline-barbell-bench-press.gif',
    'Press Banca Declinado': 'barbell-bench-press.gif',
    'Press con Mancuernas': 'dumbbell-press.gif',
    'Press Inclinado con Mancuernas': 'incline-dumbbell-press.gif',
    'Aperturas con Mancuernas': 'dumbbell-fly.gif',
    'Aperturas en Polea': 'cable-crossover.gif',
    'Fondos en Paralelas': 'chest-dips.gif',
    'Cruce de Poleas': 'cable-crossover.gif',
    'Flexiones': 'push-up.gif',
    'Press Francés': 'pushdown.gif',
    'Extensiones de Tríceps': 'pushdown.gif',
    'Fondos en Banco': 'chest-dips.gif',
    'Patada de Tríceps': 'dumbbell-kickback.gif',
    'Tríceps en Polea': 'pushdown.gif',
    'Press Cerrado': 'close-grip-bench-press.gif',
    'Flexiones Diamante': 'diamond-push-up.gif',
    'Dips en Máquina': 'chest-dips.gif',
    'Press con Barra': 'barbell-bench-press.gif',
    // PIERNA
    'Sentadilla': 'barbell-squat.gif',
    'Sentadilla con Barra': 'barbell-squat.gif',
    'Sentadilla Frontal': 'barbell-squat.gif',
    'Prensa': 'leg-extension.gif',
    'Peso Muerto Rumano': 'barbell-romanian-deadlift.gif',
    'Zancadas': 'dumbbell-lunge.gif',
    'Sentadilla Búlgara': 'dumbbell-lunge.gif',
    'Extensión de Cuádriceps': 'leg-extension.gif',
    'Curl de Femoral': 'barbell-romanian-deadlift.gif',
    'Elevación de Gemelos': 'barbell-squat.gif',
    'Prensa de Gemelos': 'barbell-squat.gif',
    'Hip Thrust': 'barbell-hip-thrust.gif',
    'Step Up': 'dumbbell-lunge.gif',
    'Sentadilla Hack': 'barbell-squat.gif',
    'Prensa Horizontal': 'leg-extension.gif',
    'Aductores': 'dumbbell-lunge.gif',
    'Abductores': 'dumbbell-lunge.gif',
    'Good Morning': 'barbell-romanian-deadlift.gif',
    'Caminata de Granjero': 'barbell-deadlift.gif',
    // HOMBRO - BRAZO
    'Press Militar': 'barbell-shoulder-press.gif',
    'Press de Hombros': 'dumbbell-shoulder-press.gif',
    'Press Arnold': 'arnold-press.gif',
    'Elevaciones Laterales': 'dumbbell-lateral-raise.gif',
    'Elevaciones Frontales': 'dumbbell-front-raise.gif',
    'Elevaciones Posteriores': 'dumbbell-lateral-raise.gif',
    'Remo al Mentón': 'barbell-upright-row.gif',
    'Pájaros': 'dumbbell-lateral-raise.gif',
    'Press de Hombros con Mancuernas': 'dumbbell-shoulder-press.gif'
  };

  selectedMuscles: string[] = [];
  editingWorkoutIndex: number | null = null;
  editingWorkout: any = null;
  editingProgressId: string | null = null;
  editFields = {
    date: '',
    type: '',
    notes: ''
  };
  expandedExerciseIndex: number = 0;
  
  // Historial expandible y editable
  expandedHistoryIndex: number | null = null;
  isEditingHistory = false;
  editExercises: { name: string; sets: { reps: number; weight: number }[] }[] = [];

  // Ejercicios predefinidos por tipo de entrenamiento (CORREGIDOS)
  exercisesByType: Record<string, string[]> = {
    'Espalda - Bíceps': [
      'Dominadas',
      'Jalón al Pecho',
      'Jalón Agarre Cerrado',
      'Remo con Barra',
      'Remo con Mancuerna',
      'Remo en Polea Baja',
      'Remo en Máquina',
      'Peso Muerto',
      'Hiperextensiones',
      'Face Pull',
      'Pullover',
      'Curl con Barra',
      'Curl con Mancuernas',
      'Curl Martillo',
      'Curl Concentrado',
      'Curl en Banco Scott',
      'Curl en Polea',
      'Curl Inclinado',
      'Curl Spider',
      'Encogimientos'
    ],
    'Pecho - Tríceps': [
      'Press Banca',
      'Press Banca Inclinado',
      'Press Banca Declinado',
      'Press con Mancuernas',
      'Press Inclinado con Mancuernas',
      'Aperturas con Mancuernas',
      'Aperturas en Polea',
      'Fondos en Paralelas',
      'Cruce de Poleas',
      'Pullover',
      'Flexiones',
      'Press Francés',
      'Extensiones de Tríceps',
      'Fondos en Banco',
      'Patada de Tríceps',
      'Tríceps en Polea',
      'Press Cerrado',
      'Flexiones Diamante',
      'Dips en Máquina',
      'Press con Barra'
    ],
    'Pierna': [
      'Sentadilla',
      'Sentadilla con Barra',
      'Sentadilla Frontal',
      'Prensa',
      'Peso Muerto',
      'Peso Muerto Rumano',
      'Zancadas',
      'Sentadilla Búlgara',
      'Extensión de Cuádriceps',
      'Curl de Femoral',
      'Elevación de Gemelos',
      'Prensa de Gemelos',
      'Hip Thrust',
      'Step Up',
      'Sentadilla Hack',
      'Prensa Horizontal',
      'Aductores',
      'Abductores',
      'Good Morning',
      'Caminata de Granjero'
    ],
    'Hombro - Brazo': [
      'Press Militar',
      'Press de Hombros',
      'Press Arnold',
      'Elevaciones Laterales',
      'Elevaciones Frontales',
      'Elevaciones Posteriores',
      'Remo al Mentón',
      'Face Pull',
      'Pájaros',
      'Encogimientos',
      'Curl con Barra',
      'Curl con Mancuernas',
      'Curl Martillo',
      'Curl Concentrado',
      'Press Francés',
      'Extensiones de Tríceps',
      'Patada de Tríceps',
      'Fondos en Banco',
      'Tríceps en Polea',
      'Press de Hombros con Mancuernas'
    ]
  };

  filteredExercises: { [key: number]: string[] } = {};

  constructor(
    private progressService: ProgressService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.workoutForm = this.buildForm();
    this.bodyCompForm = this.buildBodyCompForm();
  }

  ngOnInit(): void {
    this.loadProgress();
    this.loadBodyComp();
    this.seedHistory();
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      this.workoutForm.get('date')?.setValue(dateParam);
    }
    this.handleTypeChanges();
  }

  ngAfterViewInit(): void {
    this.refreshBodyCompCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadProgress(): void {
    this.loading = true;

    this.progressService.getSummary().subscribe({
      next: (data) => {
        // Ensure recentWorkouts is always an array
        if (data && !data.recentWorkouts) {
          data.recentWorkouts = [];
        }
        this.summary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading progress summary:', err);
        // Set default empty summary on error
        this.summary = {
          userId: '',
          totalWorkouts: 0,
          currentStreak: 0,
          recentWorkouts: []
        };
        this.loading = false;
      }
    });

    this.progressService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading progress stats:', err);
      }
    });
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: [this.workoutTypes[0], Validators.required],
      notes: [''],
      exercises: this.fb.array(this.defaultExercises(1))
    });
  }

  private buildBodyCompForm(): FormGroup {
    return this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      muscle: [this.bodyComp.muscle, [Validators.required, Validators.min(0)]],
      fat: [this.bodyComp.fat, [Validators.required, Validators.min(0)]],
      weight: [this.bodyComp.weight, [Validators.required, Validators.min(0)]]
    });
  }

  private defaultExercises(n: number) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(this.createExercise());
    }
    return arr;
  }

  private createSet(): FormGroup {
    return this.fb.group({
      reps: [10, [Validators.required, Validators.min(0.5)]],
      weight: [0, [Validators.min(0)]]
    });
  }

  private createExercise(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      sets: this.fb.array([this.createSet(), this.createSet(), this.createSet()])
    });
  }

  get exercises(): FormArray {
    return this.workoutForm.get('exercises') as FormArray;
  }

  getSets(index: number): FormArray {
    return this.exercises.at(index).get('sets') as FormArray;
  }

  addExercise(): void {
    this.exercises.push(this.createExercise());
    // Expandir el nuevo ejercicio cuando se añade
    this.expandedExerciseIndex = this.exercises.length - 1;
    // Inicializar ejercicios filtrados para el nuevo ejercicio
    this.updateFilteredExercises(this.exercises.length - 1);
  }

  getAvailableExercises(exerciseIndex: number): string[] {
    const workoutType = this.workoutForm.get('type')?.value || '';
    return this.exercisesByType[workoutType] || [];
  }

  filterExercises(exerciseIndex: number, value: string): void {
    const allExercises = this.getAvailableExercises(exerciseIndex);
    const filterValue = value.toLowerCase();
    this.filteredExercises[exerciseIndex] = allExercises.filter(ex =>
      ex.toLowerCase().includes(filterValue)
    );
  }

  updateFilteredExercises(exerciseIndex: number): void {
    const allExercises = this.getAvailableExercises(exerciseIndex);
    this.filteredExercises[exerciseIndex] = allExercises;
  }

  onExerciseInputClick(exerciseIndex: number): void {
    // Al hacer clic, mostrar todos los ejercicios disponibles
    this.updateFilteredExercises(exerciseIndex);
  }

  onExerciseInputFocus(exerciseIndex: number): void {
    // Al enfocar, asegurarse de que todos los ejercicios estén disponibles
    this.updateFilteredExercises(exerciseIndex);
  }

  onExerciseNameInput(exerciseIndex: number, value: string): void {
    this.filterExercises(exerciseIndex, value);
  }

  onExerciseNameSelected(exerciseIndex: number, exerciseName: string): void {
    const exerciseControl = this.exercises.at(exerciseIndex);
    exerciseControl.get('name')?.setValue(exerciseName);
  }


  removeExercise(index: number): void {
    if (this.exercises.length > 1) {
      this.exercises.removeAt(index);
    }
  }

  addSet(exIndex: number): void {
    this.getSets(exIndex).push(this.createSet());
  }

  removeSet(exIndex: number, setIndex: number): void {
    const sets = this.getSets(exIndex);
    if (sets.length > 1) {
      sets.removeAt(setIndex);
    }
  }

  exerciseImage(name: string): string | null {
    if (!name) return null;
    
    let gifFile: string | null = null;
    
    // Buscar exacto primero
    if (this.exerciseImages[name]) {
      gifFile = this.exerciseImages[name];
    } else {
      // Buscar case-insensitive
      const foundKey = Object.keys(this.exerciseImages).find(k => 
        k.toLowerCase() === name.toLowerCase()
      );
      if (foundKey) {
        gifFile = this.exerciseImages[foundKey];
      }
    }
    
    // Añadir el path de assets
    return gifFile ? this.GIF_PATH + gifFile : null;
  }

  getExerciseStats(index: number): { sets: number; volume: number } {
    const exercise = this.exercises.at(index);
    const sets = this.getSets(index);
    const setsArray = sets.controls;
    
    let volume = 0;
    setsArray.forEach(set => {
      const reps = set.get('reps')?.value || 0;
      const weight = set.get('weight')?.value || 0;
      volume += reps * weight;
    });

    return {
      sets: setsArray.length,
      volume: Math.round(volume)
    };
  }

  submitWorkout(): void {
    if (this.workoutForm.invalid) return;

    const payload = this.workoutForm.value;
    const totalVolume = payload.exercises.reduce((acc: number, ex: any) => {
      const setsVol = (ex.sets || []).reduce(
        (s: number, st: any) => s + (st.reps || 0) * (st.weight || 0),
        0
      );
      return acc + setsVol;
    }, 0);

    this.progressService.logWorkout(payload).subscribe({
      next: () => {
        this.history.unshift({
          date: payload.date,
          type: payload.type,
          exercises: payload.exercises.length,
          volume: totalVolume
        });
        this.workoutForm.reset({
          date: new Date().toISOString().split('T')[0],
          type: this.workoutTypes[0],
          notes: ''
        });
        this.exercises.clear();
        this.defaultExercises(1).forEach((ex) => this.exercises.push(ex));
        this.updateMuscles();
        
        // Reload progress data to update Recent Workouts
        this.loadProgress();
      },
      error: (err) => {
        console.error('Error logging workout:', err);
      }
    });
  }

  private seedHistory(): void {
    const today = new Date();
    this.history = [
      { date: today.toISOString().split('T')[0], type: 'Pecho - Tríceps', exercises: 6, volume: 14200 },
      { date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], type: 'Espalda - Bíceps', exercises: 5, volume: 13150 },
      { date: new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0], type: 'Pierna', exercises: 7, volume: 18600 },
    ];
  }

  private handleTypeChanges(): void {
    this.updateMuscles();
    this.workoutForm.get('type')?.valueChanges.subscribe((type) => {
      this.updateMuscles();
      // Actualizar ejercicios filtrados cuando cambia el tipo
      this.exercises.controls.forEach((_, index) => {
        this.updateFilteredExercises(index);
      });
      if (type) {
        this.loadLastWorkoutByType(type);
      }
    });
    const currentType = this.workoutForm.get('type')?.value;
    if (currentType) {
      this.loadLastWorkoutByType(currentType);
    }
  }

  addBodyComposition(): void {
    if (this.bodyCompForm.invalid) return;
    const value = this.bodyCompForm.value;
    this.progressService.saveBodyComposition({
      date: value.date,
      muscle: value.muscle,
      fat: value.fat,
      weight: value.weight
    }).subscribe({
      next: () => {
        this.loadBodyComp(true);
      },
      error: (err) => {
        console.error('Error saving body comp:', err);
        alert('No se pudo guardar la medición');
      }
    });
  }

  private loadBodyComp(skipFormUpdate = false): void {
    this.progressService.getBodyComposition().subscribe({
      next: (data) => {
        this.bodyCompHistory = data?.history || [];
        if (this.bodyCompHistory.length > 0) {
          this.bodyCompHistory.sort((a: any, b: any) => a.date.localeCompare(b.date));
          const latest = this.bodyCompHistory[this.bodyCompHistory.length - 1];
          this.bodyComp = { muscle: latest.muscle, fat: latest.fat, weight: latest.weight };
          if (!skipFormUpdate) {
            this.bodyCompForm.patchValue({
              date: latest.date,
              muscle: latest.muscle,
              fat: latest.fat,
              weight: latest.weight
            });
          }
        }
        this.refreshBodyCompCharts();
      },
      error: (err) => {
        console.error('Error loading body comp:', err);
        this.bodyCompHistory = [];
        this.refreshBodyCompCharts();
      }
    });
  }



  private refreshBodyCompCharts(): void {
    setTimeout(() => {
      this.destroyCharts();
      if (!this.bodyCompHistory || this.bodyCompHistory.length === 0) {
        return;
      }
      const labels = this.bodyCompHistory.map((h) => h.date);
      const muscleData = this.bodyCompHistory.map((h) => h.muscle);
      const fatData = this.bodyCompHistory.map((h) => h.fat);
      const weightData = this.bodyCompHistory.map((h) => h.weight);

      const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#8f9ba8' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          },
          y: {
            ticks: { color: '#8f9ba8' },
            grid: { color: 'rgba(255,255,255,0.06)' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      };

      const muscleCtx = document.getElementById('muscleChart') as HTMLCanvasElement | null;
      if (muscleCtx) {
        this.muscleChart = new Chart(muscleCtx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Masa muscular (kg)',
              data: muscleData,
              borderColor: '#f6c343',
              backgroundColor: 'rgba(246,195,67,0.15)',
              tension: 0.35,
              fill: true
            }]
          },
          options: commonOptions
        });
      }

      const fatCtx = document.getElementById('fatChart') as HTMLCanvasElement | null;
      if (fatCtx) {
        this.fatChart = new Chart(fatCtx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Grasa corporal (%)',
              data: fatData,
              borderColor: '#f88c6b',
              backgroundColor: 'rgba(248,140,107,0.15)',
              tension: 0.35,
              fill: true
            }]
          },
          options: commonOptions
        });
      }

      const weightCtx = document.getElementById('weightChart') as HTMLCanvasElement | null;
      if (weightCtx) {
        this.weightChart = new Chart(weightCtx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Peso (kg)',
              data: weightData,
              borderColor: '#5aa9e6',
              backgroundColor: 'rgba(90,169,230,0.15)',
              tension: 0.35,
              fill: true
            }]
          },
          options: commonOptions
        });
      }
    }, 0);
  }

  private destroyCharts(): void {
    this.muscleChart?.destroy();
    this.fatChart?.destroy();
    this.weightChart?.destroy();
  }

  private offsetDate(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  private updateMuscles(): void {
    const type = (this.workoutForm.get('type')?.value || '').toLowerCase();
    if (type.includes('espalda')) {
      this.selectedMuscles = ['espalda', 'biceps'];
    } else if (type.includes('pecho')) {
      this.selectedMuscles = ['pecho', 'triceps', 'hombro'];
    } else if (type.includes('pierna')) {
      this.selectedMuscles = ['pierna', 'gluteo'];
    } else if (type.includes('hombro') || type.includes('brazo')) {
      this.selectedMuscles = ['hombro', 'brazo'];
    } else {
      this.selectedMuscles = [];
    }
  }

  editWorkout(workout: any, index: number): void {
    if (this.editingWorkoutIndex === index) {
      this.cancelEdit();
      return;
    }
    this.editingWorkoutIndex = index;
    this.editingWorkout = workout;
    this.editingProgressId = workout.id || workout.workoutId || null;

    const dateStr = workout.date instanceof Date 
      ? workout.date.toISOString().split('T')[0]
      : new Date(workout.date).toISOString().split('T')[0];

    this.editFields = {
      date: dateStr,
      type: workout.name || '',
      notes: workout.notes || ''
    };
  }

  deleteWorkout(workout: any, index: number): void {
    if (!workout?.id && !workout?.workoutId) {
      alert('No se pudo identificar el entrenamiento.');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      const id = workout.id || workout.workoutId;
      this.progressService.deleteWorkout(id).subscribe({
        next: () => {
          this.loadProgress();
          this.editingWorkoutIndex = null;
          this.editingWorkout = null;
          this.editingProgressId = null;
        },
        error: (err) => {
          console.error('Error deleting workout:', err);
          alert('No se pudo eliminar el entrenamiento.');
        }
      });
    }
  }

  saveEditedWorkout(): void {
    if (!this.editingProgressId) return;
    const payload = {
      date: this.editFields.date,
      type: this.editFields.type,
      notes: this.editFields.notes
    };

    this.progressService.updateWorkout(this.editingProgressId, payload).subscribe({
      next: () => {
        this.loadProgress();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error updating workout:', err);
        alert('No se pudo actualizar el entrenamiento.');
      }
    });
  }

  cancelEdit(): void {
    this.editingWorkoutIndex = null;
    this.editingWorkout = null;
    this.editingProgressId = null;
    this.editFields = { date: '', type: '', notes: '' };
  }

  // === HISTORIAL EXPANDIBLE Y EDITABLE ===
  
  toggleHistoryExpand(index: number): void {
    if (this.expandedHistoryIndex === index) {
      this.expandedHistoryIndex = null;
      this.isEditingHistory = false;
    } else {
      this.expandedHistoryIndex = index;
      this.isEditingHistory = false;
    }
  }

  getWorkoutExercises(workout: any): { name: string; sets: { reps: number; weight: number }[] }[] {
    // Intentar parsear ejercicios desde notes o exercises
    if (workout.exercises && Array.isArray(workout.exercises)) {
      return workout.exercises;
    }
    
    // Intentar parsear desde notes si es JSON
    if (workout.notes) {
      try {
        let parsed: any = null;
        const notes = workout.notes;
        
        // Buscar JSON en el texto
        const jsonMatch = notes.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
        
        if (parsed && parsed.exercises) {
          return parsed.exercises.map((ex: any) => ({
            name: ex.name || ex.exercise || '',
            sets: (ex.sets || []).map((s: any) => ({
              reps: s.reps || 0,
              weight: s.weight || 0
            }))
          }));
        }
      } catch (e) {
        // No es JSON válido
      }
    }
    
    return [];
  }

  startEditHistory(workout: any, index: number): void {
    this.isEditingHistory = true;
    this.editingProgressId = workout.id || workout.workoutId || null;
    
    const exercises = this.getWorkoutExercises(workout);
    this.editExercises = exercises.length > 0 
      ? exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight }))
        }))
      : [{ name: '', sets: [{ reps: 10, weight: 0 }] }];
    
    this.editFields = {
      date: workout.date instanceof Date 
        ? workout.date.toISOString().split('T')[0]
        : new Date(workout.date).toISOString().split('T')[0],
      type: workout.name || '',
      notes: ''
    };
  }

  cancelEditHistory(): void {
    this.isEditingHistory = false;
    this.editExercises = [];
    this.editingProgressId = null;
  }

  saveEditHistory(): void {
    if (!this.editingProgressId) return;

    const payload = {
      date: this.editFields.date,
      type: this.editFields.type,
      exercises: this.editExercises
    };

    this.progressService.updateWorkout(this.editingProgressId, payload).subscribe({
      next: () => {
        this.loadProgress();
        this.cancelEditHistory();
      },
      error: (err) => {
        console.error('Error updating workout:', err);
        alert('No se pudo actualizar el entrenamiento.');
      }
    });
  }

  addEditExercise(): void {
    this.editExercises.push({ name: '', sets: [{ reps: 10, weight: 0 }] });
  }

  removeEditExercise(index: number): void {
    if (this.editExercises.length > 1) {
      this.editExercises.splice(index, 1);
    }
  }

  addEditSet(exIndex: number): void {
    this.editExercises[exIndex].sets.push({ reps: 10, weight: 0 });
  }

  removeEditSet(exIndex: number, setIndex: number): void {
    if (this.editExercises[exIndex].sets.length > 1) {
      this.editExercises[exIndex].sets.splice(setIndex, 1);
    }
  }

  private loadLastWorkoutByType(type: string): void {
    this.progressService.getLastWorkoutByType(type).subscribe({
      next: (res) => {
        const workout = res?.workout;
        if (!workout || !workout.exercises) {
          return;
        }
        this.populateExercisesFromHistory(workout.exercises);
      },
      error: (err) => {
        console.error('Error loading last workout by type', err);
      }
    });
  }

  private populateExercisesFromHistory(exercises: any[]): void {
    if (!exercises || exercises.length === 0) return;
    
    console.log('Cargando ejercicios del último entrenamiento:', exercises);
    
    // Obtener el tipo de entrenamiento actual para buscar ejercicios válidos
    const currentType = this.workoutForm.get('type')?.value || '';
    const availableExercises = this.exercisesByType[currentType] || [];
    
    // Función para normalizar nombres (quitar espacios, acentos, minúsculas)
    const normalize = (str: string) => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar acentos
        .replace(/\s+/g, '') // quitar espacios
        .trim();
    };
    
    this.exercises.clear();
    exercises.forEach((ex, index) => {
      let exerciseName = ex.name || '';
      const normalizedInput = normalize(exerciseName);
      
      // Buscar coincidencia por nombre normalizado
      const matchedExercise = availableExercises.find((e: string) => {
        const normalizedOption = normalize(e);
        return normalizedOption === normalizedInput || 
               e.toLowerCase() === exerciseName.toLowerCase();
      });
      
      // Si encontramos coincidencia, usar el nombre exacto del selector
      if (matchedExercise) {
        exerciseName = matchedExercise;
        console.log(`Matched: "${ex.name}" -> "${matchedExercise}"`);
      } else {
        console.log(`No match found for: "${ex.name}"`);
      }
      
      const setsArray = (ex.sets || []).map((s: any) => this.fb.group({
        reps: [s.reps || 10, [Validators.required, Validators.min(0.5)]],
        weight: [s.weight || 0, [Validators.min(0)]]
      }));
      const exerciseGroup = this.fb.group({
        name: [exerciseName, Validators.required],
        sets: this.fb.array(setsArray.length ? setsArray : [this.createSet()])
      });
      this.exercises.push(exerciseGroup);
      
      // Actualizar filteredExercises para este índice
      this.updateFilteredExercises(index);
    });
    
    // Expandir el primer ejercicio
    this.expandedExerciseIndex = 0;
  }
}
