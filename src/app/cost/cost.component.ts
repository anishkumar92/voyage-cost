import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cost, CostAPI, ExchangeRateAPI, PaymentCurrency, CostItem } from '../models';
import { AbstractControl, ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.scss']
})
export class CostComponent implements OnInit {
  @ViewChildren('commentInput') commentInput!: QueryList<ElementRef>;
  // @ViewChild('commentInput') commentInput!:ElementRef;
  @ViewChild('internaltype') internaltype!:ElementRef;

  costApi: CostAPI;
  data: Cost[];
  exchangeApi: ExchangeRateAPI;
  dropdown: string[] = [];
  sourceCurrency!: string;
  baseCurrency!: string;
  paymentCurrencies: PaymentCurrency[];
  initialCurrency: string;
  initial: boolean = true;
  form!: FormGroup;

  get costs() {
    return (<FormArray>this.form.get('costs')).controls;
  }

  getCostItemsFor(index: number) {
    return (<FormArray>(<FormArray>this.form.get('costs')).controls[index].get('costItems')).controls;
  }

  getCostItemCostFor(costIndex: number, costItemIndex: number) {
    return (<FormArray>(<FormArray>(<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')).controls[costItemIndex].get('costs')).controls;
  }

  getCommentsFor(costIndex: number, costItemIndex: number) {
    return (<FormArray>(<FormArray>(<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')).controls[costItemIndex].get('comments')).controls;
  }
  constructor(private route: ActivatedRoute, private fb: FormBuilder) {
    this.costApi = route.snapshot.data['costApi'];
    this.exchangeApi = route.snapshot.data['exchangeApi'];
    this.data = this.costApi.costs;
    this.sourceCurrency = this.costApi.daCurrency.currency;
    this.initialCurrency = this.costApi.daCurrency.currency;
    this.baseCurrency = this.costApi.baseCurrency.currency;
    this.paymentCurrencies = this.exchangeApi?.paymentCurrencies;
  }

  ngOnInit(): void {

    this.getCurrencyList();
    this.buildForm();
  }

  getCurrencyList() {
    this.exchangeApi?.paymentCurrencies.forEach((v) => {
      this.dropdown.push(v.toCurrency);
    });
  }

  buildForm() {
    this.form = new FormGroup({
      daCurrency: new FormGroup({
        currency: new FormControl(''),
      }),
      baseCurrency: new FormGroup({
        currency: new FormControl(''),
        exchangeRate: new FormControl(''),
      }),
      costs: this.fb.array(this.getCost())
    });
  }

  getCost() {
    return this.data.map(cost => this.fb.group({
      id: cost.id,
      name: cost.name,
      displayOrder: cost.displayOrder,
      costItems: this.fb.array(this.getCostItems(cost.costItems)),
    }));
  }

  getCostItems(costItems: any[]) {

    return costItems.map(costItems => this.fb.group({
      id: costItems.id,
      name: costItems.name,
      costItemAlias: {
        accountingCode: costItems.costItemAlias.accountingCode
      },
      annotation: {
        id: costItems.annotation.id,
        name: costItems.annotation.name,
      },
      costs: costItems.costs ? this.fb.array(this.getCostItemCost(costItems.costs)) : this.fb.array(this.getCostItemCost([])),
      comments: costItems.comments ? this.fb.array(this.getComments(costItems.comments)) : this.fb.array(this.getComments([])),
      toggle: costItems.comments? true:false
    }));
  }

  getCostItemCost(costItemsCost: any[]) {
    return costItemsCost.map(costItemsCost => this.fb.group({
      daStage: costItemsCost.daStage,
      persona: costItemsCost.persona,
      type: costItemsCost.type,
      amount: costItemsCost.amount.toFixed(2),
    }));
  }

  getComments(comments: any[]) {
    return comments?.map(comments => this.fb.group({
      id: comments.daStage,
      daStage: comments.daStage,
      persona: comments.persona,
      author: comments.author,
      comment: comments.comment,
      type: comments.type,
      date: comments.date
    }));


  }

  convertCurrency(amount: number, from: string, to: string, base = 2): number {
    let fromRate = this.paymentCurrencies?.find(v => v.toCurrency === from)?.exchangeRate;
    let toRate = this.paymentCurrencies?.find(v => v.toCurrency === to)?.exchangeRate;
    let toAmt: any = 0.00;
    if (fromRate && toRate) {

      toAmt = ((toRate / fromRate) * amount).toFixed(base);;
    }
    return toAmt
  }

  onChange(e: any) {
    this.sourceCurrency = e;
    this.form.value.costs.forEach((v: any, i: number) => {
      v.costItems.forEach((j: any, k: number) => {
        j.costs.forEach((m: any, n: any) => {
          this.form.value.costs[i].costItems[k].costs[n].amount = (this.convertCurrency(this.form.value.costs[i].costItems[k].costs[n].amount, this.initialCurrency, this.sourceCurrency));
        })
      })
    })
    this.initialCurrency = this.sourceCurrency;
  }

  get costsFA(): FormArray {
    return this.form.get('costs') as FormArray;
  }

  costItemFA(j: number): FormArray {
    return this.costsFA.at(j).get('costItems') as FormArray
  }

  calTotal(costItem: CostItem[], index: number) {
    let total = 0;
    costItem.forEach((v, i) => {
      v.costs.forEach((j, k) => {
        if (k === index) {

          total = total + parseInt(j.amount.toString())
        }
      });
    });
    return total
  }

  convertToBase(amount: number, from: string): number {
    let fromRate = this.paymentCurrencies?.find(v => v.toCurrency === from)?.exchangeRate;
    let toRate = this.paymentCurrencies?.find(v => v.toCurrency === this.baseCurrency)?.exchangeRate;
    let toAmt: any = 0.00;
    if (fromRate && toRate) {
      toAmt = ((toRate / fromRate) * amount).toFixed(2);
    }
    return toAmt
  }

  checkInternal(costIndex: number, costItemIndex: number, commentIndex: number) {
    return this.form.value.costs[costIndex].costItems[costItemIndex].comments[commentIndex].type == "Internal"
  }

  addComments(costIndex: number, costItemIndex: number) {
    let comment ="";
   this.commentInput.forEach((v,i)=>{
    console.log(v)
    if(i===costItemIndex){
      comment=v.nativeElement.value;

    }
   });
// let dumarr= this.form.value.costs[costIndex].costItems[costItemIndex].comments;
    let mmt = [{ id: 503,
      daStage: "PDA",
      persona: "BACKOFFICE",
      author: "Mr. Agency BO",
      comment: comment,
      type: this.internaltype?.nativeElement.value,
      date: "2021-03-01T10:15:35.927924Z"
    }];

    // dumarr.push(mmt);
    let cmtcntrol = this.getComments(mmt);
    // let smt:any = {} 
    
    // console.log("cmt",cmtcntrol)
    // this.form.controls.costs[0].costItems[0].comments.push(mmt)
    // (<FormArray>(<FormArray>(<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')).controls[costItemIndex].get('comments')).removeAt(0);

    (<FormArray>(<FormArray>(<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')).controls[costItemIndex].get('comments')).push(cmtcntrol[0]);
    this.form.updateValueAndValidity();
    // this.getCommentsFor(costIndex, costItemIndex);
    // (<FormArray>(<FormArray>this.itemsForm.get('ITEMS')).at(i).get('QUANTITY')).push(this.formBuilder.control(''));
    // let cmmt = this.form.value.costs[costIndex].costItems[costItemIndex].comments;
    // this.form.value.costs[costIndex].costItems[costItemIndex].comments.push({
   console.log("form",this.form);
    
    this.form.updateValueAndValidity();
    // this.form.value.costs.forEach((v: any, i: number) => {
    //   v.costItems.forEach((j: any, k: number) => {
    //     j.costs.forEach((m: any, n: any) => {
    //       this.form.value.costs[i].costItems[k].costs[n].amount = (this.convertCurrency(this.form.value.costs[i].costItems[k].costs[n].amount, this.initialCurrency, this.sourceCurrency));
    //     })
    //   })
    // })
    // this.initialCurrency = this.sourceCurrency;
  }
  toggleComments(costIndex: number, costItemIndex: number){

          this.form.value.costs[costIndex].costItems[costItemIndex].toggle = !this.form.value.costs[costIndex].costItems[costItemIndex].toggle ;

  }
}
