import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppService } from './app.service';
import { CostComponent } from './cost/cost.component';

const routes: Routes = [
  {
    path: '',
    component: CostComponent,
    resolve: {appData: AppService},
    loadChildren: () => import('./app.module').then(m => m.AppModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
