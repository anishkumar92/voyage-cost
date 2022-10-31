    export interface DaCurrency {
        currency: string;
    }

    export interface BaseCurrency {
        currency: string;
        exchangeRate: number;
    }

    export interface CostItemAlias {
        accountingCode: string;
    }

    export interface Annotation {
        id: number;
        name: string;
    }

    export interface CostItemCost {
        daStage: string;
        persona: string;
        type: string;
        amount: number;
    }

    export interface Comments {
        id: number;
        daStage: string;
        persona: string;
        author: string;
        comment: string;
        type: string;
        date: string;
    }

    export interface CostItem {
        id: number;
        name: string;
        costItemAlias: CostItemAlias;
        annotation: Annotation;
        costs: CostItemCost[];
        comments: Comments[];
    }

    export interface Cost {
        id: number;
        name: string;
        displayOrder: number;
        costItems: CostItem[];
    }

    export interface CostAPI {
        daCurrency: DaCurrency;
        baseCurrency: BaseCurrency;
        costs: Cost[];
    }


    export interface PaymentCurrency {
        fromCurrency: string;
        toCurrency: string;
        exchangeRate: number;
    }

    export interface ExchangeRateAPI {
        sourceCurrency: string;
        paymentCurrencies: PaymentCurrency[];
    }

    export interface ApiData {
        costApi: CostAPI;
        exchangeApi: ExchangeRateAPI;
    }