import { Component } from '@angular/core';

@Component({
  selector: 'app-overview',
  template: `
    <div class="progress-container">
      <h2>Your Progress</h2>
      <p>Progress tracking coming soon...</p>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class OverviewComponent {}


