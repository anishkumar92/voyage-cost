import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AppService } from './app.service';
import { ExchangeRateAPI } from './models';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateResolver implements Resolve<ExchangeRateAPI> {
  constructor(private appService:AppService) {}
 
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<ExchangeRateAPI>{
    return this.appService.getExchangeRate();
  }
}
