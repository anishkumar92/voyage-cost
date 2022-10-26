import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiData, CostAPI, ExchangeRateAPI, PaymentCurrency } from '../models';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.scss']
})
export class CostComponent implements OnInit {
  costApi!: CostAPI;
  exchangeApi!: ExchangeRateAPI;
  flexstart = "flex-start";
  dropdown:PaymentCurrency[] = [];
  constructor(private route:ActivatedRoute) {
    this.costApi = route.snapshot.data['costApi'];
    this.exchangeApi = route.snapshot.data['exchangeApi'];

    
    console.log("exchangeApi",this.exchangeApi);
    console.log("costApi",this.costApi);
    console.log("dropdown",this.dropdown);


   }

  ngOnInit(): void {
    this.exchangeApi?.paymentCurrencies.forEach((v)=>{
      console.log(v.toCurrency);
      this.dropdown.push(v);
    });
    console.log("dropdown",this.dropdown);
  }

}
