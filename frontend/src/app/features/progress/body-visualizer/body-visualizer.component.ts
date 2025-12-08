import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'quadriceps' | 'hamstrings' | 'calves' | 'glutes' | 'abs' | 'obliques';

@Component({
  selector: 'app-body-visualizer',
  templateUrl: './body-visualizer.component.html',
  styleUrls: ['./body-visualizer.component.scss']
})
export class BodyVisualizerComponent implements OnChanges {
  @Input() muscles: string[] = [];

  activeMuscles: Set<string> = new Set();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['muscles']) {
      this.updateActiveMuscles();
    }
  }

  private updateActiveMuscles(): void {
    this.activeMuscles.clear();
    
    // Map Spanish/English muscle names to SVG IDs
    const muscleMap: { [key: string]: string[] } = {
      'pecho': ['chest'],
      'chest': ['chest'],
      'espalda': ['back'],
      'back': ['back'],
      'dorsal': ['back'],
      'biceps': ['biceps'],
      'triceps': ['triceps'],
      'hombro': ['shoulders'],
      'shoulders': ['shoulders'],
      'deltoides': ['shoulders'],
      'pierna': ['quadriceps', 'hamstrings', 'calves', 'glutes'],
      'quadriceps': ['quadriceps'],
      'hamstrings': ['hamstrings'],
      'calves': ['calves'],
      'gluteo': ['glutes'],
      'glutes': ['glutes'],
      'brazo': ['biceps', 'triceps'],
      'forearms': ['forearms'],
      'abs': ['abs'],
      'obliques': ['obliques']
    };

    this.muscles.forEach(muscle => {
      const key = muscle.toLowerCase();
      const mapped = muscleMap[key];
      if (mapped) {
        mapped.forEach(m => this.activeMuscles.add(m));
      }
    });
  }

  isActive(muscleId: string): boolean {
    return this.activeMuscles.has(muscleId);
  }
}
