export class BillDTO {
    billTotal: number;
    baseFee: number;
    transactionFee: number;
    discountApplied: number;
    periods: BillPeriod[];

    constructor() {
        this.billTotal = 0;
        this.baseFee = 0;
        this.transactionFee = 0;
        this.discountApplied = 0;
        this.periods = [];
    }
}

export class BillPeriod {
    baseFee: number;
    transactionFee: number;
    discountAppliedBaseFee: number;
    discountAppliedTransactionFee: number;
    discountDaysClaimed: number;
    activeDaysInMonth: number;
    daysInMonth: number;
    period: string;
}
