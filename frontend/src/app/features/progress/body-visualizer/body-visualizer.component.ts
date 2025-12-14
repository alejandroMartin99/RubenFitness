import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-body-visualizer',
  templateUrl: './body-visualizer.component.html',
  styleUrls: ['./body-visualizer.component.scss']
})
export class BodyVisualizerComponent implements OnChanges {
  @Input() muscles: string[] = [];

  activeMuscles: Set<string> = new Set();
  currentView: 'front' | 'back' = 'front';

  // Nombres legibles para los músculos
  private muscleNames: { [key: string]: string } = {
    'chest': 'Pecho',
    'back': 'Espalda',
    'shoulders': 'Hombros',
    'biceps': 'Bíceps',
    'triceps': 'Tríceps',
    'forearms': 'Antebrazos',
    'quadriceps': 'Cuádriceps',
    'hamstrings': 'Isquios',
    'calves': 'Gemelos',
    'glutes': 'Glúteos',
    'abs': 'Abdominales',
    'obliques': 'Oblicuos'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['muscles']) {
      this.updateActiveMuscles();
    }
  }

  private updateActiveMuscles(): void {
    this.activeMuscles.clear();
    
    const muscleMap: { [key: string]: string[] } = {
      'pecho': ['chest'],
      'chest': ['chest'],
      'espalda': ['back'],
      'back': ['back'],
      'dorsal': ['back'],
      'biceps': ['biceps'],
      'triceps': ['triceps'],
      'hombro': ['shoulders'],
      'hombros': ['shoulders'],
      'shoulders': ['shoulders'],
      'pierna': ['quadriceps', 'hamstrings', 'calves', 'glutes'],
      'piernas': ['quadriceps', 'hamstrings', 'calves', 'glutes'],
      'quadriceps': ['quadriceps'],
      'hamstrings': ['hamstrings'],
      'calves': ['calves'],
      'gluteo': ['glutes'],
      'glutes': ['glutes'],
      'brazo': ['biceps', 'triceps', 'forearms'],
      'forearms': ['forearms'],
      'abs': ['abs'],
      'obliques': ['obliques']
    };

    this.muscles.forEach(muscle => {
      const key = muscle.toLowerCase().trim();
      const mapped = muscleMap[key];
      if (mapped) {
        mapped.forEach(m => this.activeMuscles.add(m));
      }
    });

    // Auto-seleccionar vista
    this.autoSelectView();
  }

  private autoSelectView(): void {
    const backMuscles = ['back', 'hamstrings', 'glutes', 'triceps', 'calves'];
    const hasBackMuscles = backMuscles.some(m => this.activeMuscles.has(m));
    const frontMuscles = ['chest', 'abs', 'obliques', 'quadriceps', 'biceps', 'shoulders'];
    const hasFrontMuscles = frontMuscles.some(m => this.activeMuscles.has(m));
    
    if (hasBackMuscles && !hasFrontMuscles) {
      this.currentView = 'back';
    } else {
      this.currentView = 'front';
    }
  }

  setView(view: 'front' | 'back'): void {
    this.currentView = view;
  }

  isActive(muscleId: string): boolean {
    return this.activeMuscles.has(muscleId);
  }

  getActiveMuscleNames(): string[] {
    return Array.from(this.activeMuscles)
      .map(m => this.muscleNames[m] || m)
      .sort();
  }
}
