import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CostAPI, ExchangeRateAPI } from './models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  public getCosts(): Observable<CostAPI> {
    return this.http.get<CostAPI>('/assets/costs.json');
  }

  public getExchangeRate(): Observable<ExchangeRateAPI> {
    return this.http.get<ExchangeRateAPI>('/assets/exchange-rates.json');
  }

}
