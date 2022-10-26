import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CostResolver } from './cost.resolver';
import { CostComponent } from './cost/cost.component';
import { ExchangeRateResolver } from './exchange-rate.resolver';

const routes: Routes = [
  {
    path: '',
    component: CostComponent,
    resolve:{costApi:CostResolver,exchangeApi:ExchangeRateResolver}
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
