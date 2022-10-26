import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiData, CostAPI, ExchangeRateAPI } from '../models';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.css']
})
export class CostComponent implements OnInit {
  costApi!: CostAPI;
  exchangeApi!: ExchangeRateAPI;
  constructor(private route:ActivatedRoute) {
    this.costApi = route.snapshot.data['costApi'];
    this.exchangeApi = route.snapshot.data['exchangeApi'];
    console.log("exchangeApi",this.exchangeApi);
    console.log("costApi",this.costApi);

   }

  ngOnInit(): void {

  }

}
