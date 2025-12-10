import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { MaterialModule } from '../../core/material/material.module';

const routes: Routes = [
  { path: '', component: ClientsComponent },
  { path: 'client/:id', component: ClientDetailsComponent }
];

@NgModule({
  declarations: [ClientsComponent, ClientDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ]
})
export class CoachModule { }


