import { CreateCurrencyDTO } from 'src/currencies/dto/create-currency.dto';
import { AccountDTO } from './dto/account.dto';
import { BillDTO, BillPeriod } from './dto/bill.dto';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';

const millisecondsInADay = 1000 * 60 * 60 * 24;
const perTransactionFee = 0.05;

export class GenerateBill {
    private billDTO = new BillDTO();
    private iteratedDate: Date;
    private account: AccountDTO;
    private calculateAccountTotalBillDTO: CalculateAccountTotalBillDTO;
    private billingPeriodStart: Date;
    private billingPeriodEnd: Date;
    private discountDaysRemaining: number;

    public Generate(
        account: AccountDTO,
        currency: CreateCurrencyDTO,
        calculateAccountTotalBillDTO: CalculateAccountTotalBillDTO,
    ): BillDTO {
        this.account = account;
        this.calculateAccountTotalBillDTO = calculateAccountTotalBillDTO;
        this.initialisePeriodVariables();
        if (this.billingPeriodEnd < this.account.creationDate)
            return this.billDTO;

        let discountDaysClaimed = 0;
        let activeDaysInMonth = 0;
        let daysInMonth = this.getDaysInMonth(this.iteratedDate);
        let iteratingMonth = this.iteratedDate.getMonth();
        let iteratingYear = this.iteratedDate.getFullYear();
        let currentBill;

        while (this.iteratedDate <= this.billingPeriodEnd) {
            if (
                this.iteratedDate.getFullYear() > iteratingYear ||
                this.iteratedDate.getMonth() != iteratingMonth
            ) {
                currentBill = this.getCurrentBill(
                    iteratingYear,
                    iteratingMonth,
                    activeDaysInMonth,
                    daysInMonth,
                    currency as CreateCurrencyDTO,
                    discountDaysClaimed,
                );
                this.billDTO.periods.push(currentBill);
                iteratingMonth = this.iteratedDate.getMonth();
                iteratingYear = this.iteratedDate.getFullYear();
                daysInMonth = this.getDaysInMonth(this.iteratedDate);
                activeDaysInMonth = 0;
                discountDaysClaimed = 0;
            }
            this.iteratedDate.setDate(this.iteratedDate.getDate() + 1);
            activeDaysInMonth++;
            if (this.discountDaysRemaining > 0) {
                discountDaysClaimed++;
            }
            this.discountDaysRemaining--;
        }
        currentBill = this.getCurrentBill(
            iteratingYear,
            iteratingMonth,
            activeDaysInMonth,
            daysInMonth,
            currency as CreateCurrencyDTO,
            discountDaysClaimed,
        );
        this.billDTO.periods.push(currentBill);
        this.applyTransactionFees();
        this.sumBill();
        return this.billDTO;
    }

    private initialisePeriodVariables(): void {
        this.billDTO = new BillDTO();
        this.billingPeriodStart = new Date(
            this.calculateAccountTotalBillDTO.billingPeriodStart,
        );
        this.billingPeriodEnd = new Date(
            this.calculateAccountTotalBillDTO.billingPeriodEnd,
        );
        this.iteratedDate = new Date(
            this.account.creationDate > this.billingPeriodStart
                ? this.account.creationDate
                : this.billingPeriodStart,
        );
        this.setDiscountDaysRemaining();
    }

    private setDiscountDaysRemaining(): void {
        this.discountDaysRemaining =
            this.account.discountDays -
            (this.iteratedDate.getTime() -
                this.account.creationDate.getTime()) /
                millisecondsInADay;
        this.discountDaysRemaining =
            this.discountDaysRemaining > 0 ? this.discountDaysRemaining : 0;
    }

    private createPeriodString(
        iteratingYear: number,
        iteratingMonth: number,
    ): string {
        return `${iteratingYear.toString()}-${(iteratingMonth + 1).toString().padStart(2, '0')}`;
    }

    private getDaysInMonth(date: Date): number {
        const workingDate = new Date(date);
        workingDate.setDate(15);
        workingDate.setMonth(workingDate.getMonth() + 1);
        workingDate.setDate(0);
        return workingDate.getDate();
    }

    private getCurrentBill(
        iteratingYear: number,
        iteratingMonth: number,
        activeDaysInMonth: number,
        daysInMonth: number,
        currency: CreateCurrencyDTO,
        discountDaysClaimed: number,
    ) {
        const currentBill = this.makeNewCurrentBill(
            iteratingYear,
            iteratingMonth,
        );
        currentBill.baseFee =
            (activeDaysInMonth / daysInMonth) * currency.monthlyFeeGbp;
        currentBill.discountDaysClaimed = discountDaysClaimed;
        currentBill.transactionFee = 0;
        currentBill.discountAppliedBaseFee =
            ((discountDaysClaimed / activeDaysInMonth) *
                currentBill.baseFee *
                this.account.discountRate) /
            100;
        currentBill.activeDaysInMonth = activeDaysInMonth;
        currentBill.daysInMonth = daysInMonth;
        return currentBill;
    }

    private makeNewCurrentBill(
        iteratingYear: number,
        iteratingMonth: number,
    ): BillPeriod {
        return {
            baseFee: 0,
            transactionFee: 0,
            discountAppliedBaseFee: 0,
            discountAppliedTransactionFee: 0,
            discountDaysClaimed: 0,
            activeDaysInMonth: 0,
            daysInMonth: 0,
            period: this.createPeriodString(iteratingYear, iteratingMonth),
        } as BillPeriod;
    }

    private getTotalBillDays(): number {
        return this.billDTO.periods.reduce(
            (sum, p) => sum + p.activeDaysInMonth,
            0,
        );
    }

    private addTransactionFees(
        transactionsPerDay: number,
        activeDaysInMonth: number,
        discountDaysClaimed: number,
    ) {
        const transactionsThisPeriod = transactionsPerDay * activeDaysInMonth;
        let transactionFee = 0;
        let discountApplied = 0;
        if (this.account.transactionThreshold < transactionsThisPeriod) {
            transactionFee =
                perTransactionFee *
                (transactionsThisPeriod - this.account.transactionThreshold);
            const exceededThresholdOnDay = Math.ceil(
                this.account.transactionThreshold / transactionsPerDay,
            );
            if (discountDaysClaimed > exceededThresholdOnDay) {
                discountApplied =
                    ((discountDaysClaimed / activeDaysInMonth) *
                        transactionFee *
                        this.account.discountRate) /
                    100;
            }
        }
        return { transactionFee, discountApplied };
    }

    private applyTransactionFees(): void {
        const totalBillDays = this.getTotalBillDays();
        const transactionsPerDay =
            this.calculateAccountTotalBillDTO.transactionCount / totalBillDays;

        this.billDTO.periods.forEach((element) => {
            const object = this.addTransactionFees(
                transactionsPerDay,
                element.activeDaysInMonth,
                element.discountDaysClaimed,
            );
            element.transactionFee = object.transactionFee;
            element.discountAppliedTransactionFee = object.discountApplied;
        });
    }

    private sumBill(): void {
        this.billDTO.baseFee = this.billDTO.periods.reduce(
            (sum, p) => sum + p.baseFee,
            0,
        );
        const discountAppliedBaseFee = this.billDTO.periods.reduce(
            (sum, p) => sum + p.discountAppliedBaseFee,
            0,
        );
        const discountAppliedTransactionFee = this.billDTO.periods.reduce(
            (sum, p) => sum + p.discountAppliedTransactionFee,
            0,
        );
        this.billDTO.discountApplied =
            discountAppliedBaseFee + discountAppliedTransactionFee;
        this.billDTO.transactionFee = this.billDTO.periods.reduce(
            (sum, p) => sum + p.transactionFee,
            0,
        );
        this.billDTO.billTotal =
            this.billDTO.baseFee +
            this.billDTO.transactionFee -
            this.billDTO.discountApplied;
    }
}
