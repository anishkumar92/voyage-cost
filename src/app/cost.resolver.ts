import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { CostAPI } from './models';

@Injectable({
  providedIn: 'root'
})
export class CostResolver implements Resolve<CostAPI> {
  constructor(private appService:AppService) {}
 
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<CostAPI>{
    return this.appService.getCosts();
  }
}
