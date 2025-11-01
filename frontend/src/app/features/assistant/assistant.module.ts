import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { MaterialModule } from '../../core/material/material.module';

const routes: Routes = [
  { path: '', component: ChatComponent }
];

@NgModule({
  declarations: [ChatComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ]
})
export class AssistantModule { }


