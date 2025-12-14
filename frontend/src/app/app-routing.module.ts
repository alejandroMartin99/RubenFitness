/**
 * Application Routing Module
 * Defines all application routes with lazy loading
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { HomeRedirectGuard } from './core/guards/home-redirect.guard';
import { UserOnlyGuard } from './core/guards/user-only.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [HomeRedirectGuard],
    children: []
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard, UserOnlyGuard]
  },
  {
    path: 'assistant',
    loadChildren: () => import('./features/assistant/assistant.module').then(m => m.AssistantModule),
    canActivate: [AuthGuard, UserOnlyGuard]
  },
  {
    path: 'progress',
    loadChildren: () => import('./features/progress/progress.module').then(m => m.ProgressModule),
    canActivate: [AuthGuard, UserOnlyGuard]
  },
  {
    path: 'motivation',
    loadChildren: () => import('./features/motivation/motivation.module').then(m => m.MotivationModule),
    canActivate: [AuthGuard, UserOnlyGuard]
  },
  {
    path: 'coach',
    loadChildren: () => import('./features/coach/coach.module').then(m => m.CoachModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    canActivate: [HomeRedirectGuard],
    children: []
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


