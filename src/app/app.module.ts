import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CostComponent } from './cost/cost.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    CostComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  bootstrap:[AppComponent]
})
export class AppModule { }
