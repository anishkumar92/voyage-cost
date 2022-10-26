import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CostComponent } from './cost/cost.component';


@NgModule({
  declarations: [
    AppComponent,
    CostComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule
  ]
})
export class AppModule { }
