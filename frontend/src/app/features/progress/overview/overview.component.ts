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

  exerciseImages: Record<string, string> = {
    'press banca': 'https://images.pexels.com/photos/1552102/pexels-photo-1552102.jpeg?auto=compress&cs=tinysrgb&w=800',
    'sentadilla': 'https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg?auto=compress&cs=tinysrgb&w=800',
    'peso muerto': 'https://images.pexels.com/photos/4761669/pexels-photo-4761669.jpeg?auto=compress&cs=tinysrgb&w=800',
    'remo': 'https://images.pexels.com/photos/3839022/pexels-photo-3839022.jpeg?auto=compress&cs=tinysrgb&w=800',
    'dominadas': 'https://images.pexels.com/photos/3837758/pexels-photo-3837758.jpeg?auto=compress&cs=tinysrgb&w=800'
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
      reps: [10, [Validators.required, Validators.min(1)]],
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
    const key = name.toLowerCase();
    return this.exerciseImages[key] || null;
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
    this.exercises.clear();
    exercises.forEach((ex) => {
      const setsArray = (ex.sets || []).map((s: any) => this.fb.group({
        reps: [s.reps || 0, [Validators.required, Validators.min(1)]],
        weight: [s.weight || 0, [Validators.min(0)]]
      }));
      const exerciseGroup = this.fb.group({
        name: [ex.name || '', Validators.required],
        sets: this.fb.array(setsArray.length ? setsArray : [this.createSet()])
      });
      this.exercises.push(exerciseGroup);
    });
  }
}
