import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AchievementsComponent } from './achievements/achievements.component';
import { StreaksComponent } from './streaks/streaks.component';
import { MotivationComponent } from './motivation/motivation.component';
import { MaterialModule } from '../../core/material/material.module';

const routes: Routes = [
  { path: '', component: MotivationComponent }
];

@NgModule({
  declarations: [
    MotivationComponent,
    AchievementsComponent,
    StreaksComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ]
})
export class MotivationModule { }

