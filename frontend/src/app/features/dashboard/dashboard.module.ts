import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { WaterTrackingComponent } from './home/water/water-tracking.component';
import { SleepTrackingComponent } from './home/sleep/sleep-tracking.component';
import { MaterialModule } from '../../core/material/material.module';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    WaterTrackingComponent,
    SleepTrackingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ]
})
export class DashboardModule { }
