import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Cost,
  CostAPI,
  ExchangeRateAPI,
  PaymentCurrency,
  CostItem,
  CostItemCost,
  Comments,
} from '../models';
import {
  AbstractControl,
  ControlContainer,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-cost',
  templateUrl: './cost.component.html',
  styleUrls: ['./cost.component.scss'],
})
export class CostComponent implements OnInit {
  @ViewChildren('commentInput') commentInput!: QueryList<ElementRef>;
  @ViewChildren('internaltype') internaltype!: QueryList<ElementRef>;
  @ViewChildren('commentInputEdit') commentInputEdit!: QueryList<ElementRef>;
  @ViewChildren('internaltypeEdit') internaltypeEdit!: QueryList<ElementRef>;

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
    return (<FormArray>(
      (<FormArray>this.form.get('costs')).controls[index].get('costItems')
    )).controls;
  }

  getCostItemCostFor(costIndex: number, costItemIndex: number) {
    return (<FormArray>(
      (<FormArray>(
        (<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')
      )).controls[costItemIndex].get('costs')
    )).controls;
  }

  getCommentsFor(costIndex: number, costItemIndex: number) {
    return (<FormArray>(
      (<FormArray>(
        (<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')
      )).controls[costItemIndex].get('comments')
    )).controls;
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

  getCurrencyList(): void {
    this.exchangeApi?.paymentCurrencies.forEach((v) => {
      this.dropdown.push(v.toCurrency);
    });
  }

  buildForm(): void {
    this.form = new FormGroup({
      daCurrency: new FormGroup({
        currency: new FormControl(''),
      }),
      baseCurrency: new FormGroup({
        currency: new FormControl(''),
        exchangeRate: new FormControl(''),
      }),
      costs: this.fb.array(this.getCost()),
    });
  }

  getCost(): Array<FormGroup> {
    return this.data.map((cost) =>
      this.fb.group({
        id: cost.id,
        name: cost.name,
        displayOrder: cost.displayOrder,
        costItems: this.fb.array(this.getCostItems(cost.costItems)),
      })
    );
  }

  getCostItems(costItems: Array<CostItem>): Array<FormGroup> {
    return costItems.map((costItems) =>
      this.fb.group({
        id: costItems.id,
        name: costItems.name,
        costItemAlias: {
          accountingCode: costItems.costItemAlias.accountingCode,
        },
        annotation: {
          id: costItems.annotation.id,
          name: costItems.annotation.name,
        },
        costs: costItems.costs
          ? this.fb.array(this.getCostItemCost(costItems.costs))
          : this.fb.array(this.getCostItemCost([])),
        comments: costItems.comments
          ? this.fb.array(this.getComments(costItems.comments))
          : this.fb.array(this.getComments([])),
        toggle: true,
        addButton: true,
      })
    );
  }

  getCostItemCost(costItemsCost: Array<CostItemCost>): Array<FormGroup> {
    return costItemsCost.map((costItemsCost) =>
      this.fb.group({
        daStage: costItemsCost.daStage,
        persona: costItemsCost.persona,
        type: costItemsCost.type,
        amount: costItemsCost.amount
          ? parseFloat(costItemsCost.amount.toFixed(2))
          : costItemsCost.amount,
      })
    );
  }

  getComments(comments: Array<Comments>): Array<FormGroup> {
    return comments?.map((comments) =>
      this.fb.group({
        id: comments.daStage,
        daStage: comments.daStage,
        persona: comments.persona,
        author: comments.author,
        comment: comments.comment,
        type: comments.type,
        date: comments.date,
        editMode: false,
      })
    );
  }

  convertCurrency(amount: number, from: string, to: string, base = 2): number {
    let fromRate = this.paymentCurrencies?.find(
      (v) => v.toCurrency === from
    )?.exchangeRate;
    let toRate = this.paymentCurrencies?.find(
      (v) => v.toCurrency === to
    )?.exchangeRate;
    let toAmt: number = 0.0;
    if (fromRate && toRate) {
      toAmt = parseFloat(((toRate / fromRate) * amount).toFixed(base));
    }
    return toAmt;
  }

  onChange(currency: string): void {
    this.sourceCurrency = currency;
    this.form.value.costs.forEach((cost: Cost, i: number) => {
      cost.costItems.forEach((costItem: CostItem, k: number) => {
        costItem.costs.forEach((m: CostItemCost, n: number) => {
          this.form.value.costs[i].costItems[k].costs[n].amount =
            this.convertCurrency(
              this.form.value.costs[i].costItems[k].costs[n].amount,
              this.initialCurrency,
              this.sourceCurrency
            );
        });
      });
    });
    this.initialCurrency = this.sourceCurrency;
  }

  get costsFA(): FormArray {
    return this.form.get('costs') as FormArray;
  }

  costItemFA(costItemIndex: number): FormArray {
    return this.costsFA.at(costItemIndex).get('costItems') as FormArray;
  }

  calTotal(costItem: Array<CostItem>, index: number): number {
    let total: number = 0;
    costItem.forEach((costItem: CostItem) => {
      costItem.costs.forEach((costItemCost: CostItemCost, k: number) => {
        if (k === index) {
          total = total + costItemCost.amount;
        }
      });
    });
    return total;
  }

  convertToBase(amount: number, from: string): number {
    let fromRate = this.paymentCurrencies?.find(
      (payCurrency: PaymentCurrency) => payCurrency.toCurrency === from
    )?.exchangeRate;
    let toRate = this.costApi.baseCurrency.exchangeRate;
    let toAmt: number = 0.0;
    if (fromRate && toRate) {
      toAmt = Number((toRate / fromRate) * amount);
    }
    return toAmt;
  }

  checkInternal(
    costIndex: number,
    costItemIndex: number,
    commentIndex: number
  ): boolean {
    return (
      this.form.value.costs[costIndex].costItems[costItemIndex].comments[
        commentIndex
      ].type == 'Internal'
    );
  }

  checkAdd(e: Event, costIndex: number, costItemIndex: number): void {
    let comment: string = '';
    let internaltype = '';
    let tempID = `i${costIndex}-j${costItemIndex}`;
    this.commentInput.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        comment = v.nativeElement.value;
      }
    });
    this.internaltype.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        internaltype = v.nativeElement.value;
      }
    });
    if (
      comment == null ||
      comment == undefined ||
      comment == '' ||
      internaltype == '' ||
      internaltype == null ||
      internaltype == undefined
    ) {
      this.form.value.costs[costIndex].costItems[costItemIndex].addButton =
        true;
    } else {
      this.form.value.costs[costIndex].costItems[costItemIndex].addButton =
        false;
    }
  }

  checkType(e: Event, costIndex: number, costItemIndex: number): void {
    let comment: any = '';
    let internaltype = '';
    let tempID = `i${costIndex}-j${costItemIndex}`;
    this.commentInput.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        comment = v.nativeElement;
      }
    });
    this.internaltype.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        internaltype = v.nativeElement.value;
        comment.disabled = false;
      }
    });
  }

  addComments(costIndex: number, costItemIndex: number): void {
    let comment: string = '';
    let internaltype = 'Internal';
    let tempID = `i${costIndex}-j${costItemIndex}`;
    this.commentInput.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        comment = v.nativeElement.value;
        v.nativeElement.value = '';
        v.nativeElement.disabled = true;
      }
    });
    this.internaltype.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        internaltype = v.nativeElement.value;
        v.nativeElement.value = '';
      }
    });
    let curDate = new Date();
    let newComment = [
      {
        id: 503,
        daStage: 'PDA',
        persona: 'BACKOFFICE',
        author: 'Mr. Agency BO',
        comment: comment,
        type: internaltype,
        editMode: false,
        date: curDate.toISOString(),
      },
    ];

    let commentCtrl: Array<FormGroup> = this.getComments(newComment);

    (<FormArray>(
      (<FormArray>(
        (<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')
      )).controls[costItemIndex].get('comments')
    )).push(commentCtrl[0]);
    this.form.value.costs[costIndex].costItems[costItemIndex].toggle = true;
  }

  toggleComments(costIndex: number, costItemIndex: number): void {
    this.form.value.costs[costIndex].costItems[costItemIndex].toggle
      ? (this.form.value.costs[costIndex].costItems[costItemIndex].toggle =
          false)
      : (this.form.value.costs[costIndex].costItems[costItemIndex].toggle =
          true);
  }

  removeCmt(
    costIndex: number,
    costItemIndex: number,
    costItemCostIndex: number
  ): void {
    (<FormArray>(
      (<FormArray>(
        (<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')
      )).controls[costItemIndex].get('comments')
    )).removeAt(costItemCostIndex);
    this.form.value.costs[costIndex].costItems[costItemIndex].toggle = true;
  }

  onEdit(costIndex: number, costItemIndex: number, commentIndex: number): void {
    this.form.value.costs[costIndex].costItems[costItemIndex].comments[
      commentIndex
    ].editMode = true;
    this.form.value.costs[costIndex].costItems[costItemIndex].toggle = true;
  }

  saveComments(
    costIndex: number,
    costItemIndex: number,
    commentIndex: number
  ): void {
    let comment: string = '';
    let internaltype = 'Internal';
    let tempID = `i${costIndex}-j${costItemIndex}-k${commentIndex}`;
    this.commentInputEdit.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        comment = v.nativeElement.value;
        v.nativeElement.value = '';
      }
    });
    this.internaltypeEdit.forEach((v, i) => {
      if (tempID === v.nativeElement.id) {
        internaltype = v.nativeElement.value;
        v.nativeElement.value = '';
      }
    });
    let curDate = new Date();

    let editComment = [
      {
        id: 503,
        daStage: 'PDA',
        persona: 'BACKOFFICE',
        author: 'Mr. Agency BO',
        comment: comment,
        type: internaltype,
        editMode: false,
        date: curDate.toISOString(),
      },
    ];
    (<FormArray>(
      (<FormArray>(
        (<FormArray>this.form.get('costs')).controls[costIndex].get('costItems')
      )).controls[costItemIndex].get('comments')
    )).controls[commentIndex].setValue(editComment[0]);
    this.form.value.costs[costIndex].costItems[costItemIndex].toggle = true;
  }
}
