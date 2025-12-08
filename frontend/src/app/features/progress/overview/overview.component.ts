import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgressService } from '../../../core/services/progress.service';
import { ProgressSummary, ProgressStats } from '../../../core/models/progress.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
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

  exerciseImages: Record<string, string> = {
    'press banca': 'https://images.pexels.com/photos/1552102/pexels-photo-1552102.jpeg?auto=compress&cs=tinysrgb&w=800',
    'sentadilla': 'https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg?auto=compress&cs=tinysrgb&w=800',
    'peso muerto': 'https://images.pexels.com/photos/4761669/pexels-photo-4761669.jpeg?auto=compress&cs=tinysrgb&w=800',
    'remo': 'https://images.pexels.com/photos/3839022/pexels-photo-3839022.jpeg?auto=compress&cs=tinysrgb&w=800',
    'dominadas': 'https://images.pexels.com/photos/3837758/pexels-photo-3837758.jpeg?auto=compress&cs=tinysrgb&w=800'
  };

  selectedMuscles: string[] = [];

  constructor(
    private progressService: ProgressService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.workoutForm = this.buildForm();
  }

  ngOnInit(): void {
    this.loadProgress();
    this.seedHistory();
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    if (dateParam) {
      this.workoutForm.get('date')?.setValue(dateParam);
    }
    this.handleTypeChanges();
  }

  loadProgress(): void {
    this.loading = true;

    this.progressService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading progress summary:', err);
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
      exercises: this.fb.array(this.defaultExercises(5))
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
        this.defaultExercises(5).forEach((ex) => this.exercises.push(ex));
        this.updateMuscles();
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
    this.workoutForm.get('type')?.valueChanges.subscribe(() => this.updateMuscles());
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
}
