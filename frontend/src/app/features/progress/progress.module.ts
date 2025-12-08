import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { ChartsComponent } from './charts/charts.component';
import { BeforeAfterComponent } from './before-after/before-after.component';
import { BodyVisualizerComponent } from './body-visualizer/body-visualizer.component';
import { MaterialModule } from '../../core/material/material.module';

const routes: Routes = [
  { path: '', component: OverviewComponent }
];

@NgModule({
  declarations: [
    OverviewComponent,
    ChartsComponent,
    BeforeAfterComponent,
    BodyVisualizerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ]
})
export class ProgressModule { }


