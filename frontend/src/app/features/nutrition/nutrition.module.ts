import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NutritionComponent } from './nutrition/nutrition.component';
import { MaterialModule } from '../../core/material/material.module';

const routes: Routes = [
  { path: '', component: NutritionComponent }
];

@NgModule({
  declarations: [
    NutritionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ]
})
export class NutritionModule { }

