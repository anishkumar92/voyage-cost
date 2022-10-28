import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiData, Cost, CostAPI, ExchangeRateAPI, PaymentCurrency } from '../models';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.scss']
})
export class CostComponent implements OnInit {
  costApi: CostAPI;
  exchangeApi: ExchangeRateAPI;
  dropdown:string[] = [];
  costs:Cost[];
  sourceCurrency!:string;
  baseCurrency!:string;
  paymentCurrencies: PaymentCurrency[];
  initialCurrency: string;
  initial: boolean = true;
  constructor(private route:ActivatedRoute) {
    this.costApi = route.snapshot.data['costApi'];
    this.exchangeApi = route.snapshot.data['exchangeApi'];
    this.costs = this.costApi.costs;
    this.sourceCurrency = this.costApi.daCurrency.currency;
    this.initialCurrency = this.costApi.daCurrency.currency;
    this.baseCurrency = this.costApi.baseCurrency.currency;
    this.paymentCurrencies = this.exchangeApi?.paymentCurrencies;
    // this.selectedCurrency = this.paymentCurrencies?.find(v=> v.toCurrency === this.sourceCurrency)
    console.log("exchangeApi",this.exchangeApi);
    console.log("costApi",this.costApi);
    console.log("dropdown",this.dropdown);

   }

  ngOnInit(): void {
    this.exchangeApi?.paymentCurrencies.forEach((v)=>{
      console.log(v.toCurrency);
      this.dropdown.push(v.toCurrency);
    });
    console.log("dropdown",this.dropdown);
    
  }

  convertCurrency(amount:number,from:string,to:string):number{
   

      let fromRate = this.paymentCurrencies?.find(v=> v.toCurrency === from)?.exchangeRate;
      let toRate = this.paymentCurrencies?.find(v=> v.toCurrency === to)?.exchangeRate;
      let toAmt = 0;
      if(fromRate && toRate){

        toAmt = ((toRate / fromRate) * amount);
      }
      return toAmt
    
}

onChange(e:any){
  console.log("event",e)
  this.sourceCurrency = e;
  // this.initial=false;
}

}
