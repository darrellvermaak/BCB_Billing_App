import {
    Injectable,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';

import { AccountDTO } from './dto/account.dto';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { CreateCurrencyDTO } from 'src/currencies/dto/create-currency.dto';

const millisecondsInADay = 1000 * 60 * 60 * 24;
const perTransactionFee = 0.05;

@Injectable()
export class AccountsService {
    constructor(private currenciesService: CurrenciesService) {}

    private accounts: AccountDTO[] = [];

    create(account: AccountDTO) {
        const existingAccount = this.accountExists(account.accountId);
        if (existingAccount) {
            throw new ConflictException('Account with this ID already exists');
        }
        this.accounts.push(account);
        return account;
    }

    calculateTotalBill(
        calculateAccountTotalBillDTO: CalculateAccountTotalBillDTO,
    ) {
        const accountExists = this.accountExists(
            calculateAccountTotalBillDTO.accountId,
        );
        if (!accountExists) {
            throw new BadRequestException('Account not found');
        }

        const billDTO = {
            billTotal: 0,
            baseFee: 0,
            transactionFee: 0,
            discountApplied: 0,
            periods: [] as {
                baseFee: number;
                transactionFee: number;
                discountAppliedBaseFee: number;
                discountAppliedTransactionFee: number;
                discountDaysClaimed: number;
                activeDaysInMonth: number;
                daysInMonth: number;
                period: string;
            }[],
        };

        const account = this.getAccount(calculateAccountTotalBillDTO.accountId);
        const currency = this.currenciesService.getCurrency(account!.currency);
        console.log(`currency : ${JSON.stringify(currency)}`);
        const billingPeriodStart = new Date(
            calculateAccountTotalBillDTO.billingPeriodStart,
        );
        const billingPeriodEnd = new Date(
            calculateAccountTotalBillDTO.billingPeriodEnd,
        );
        // if billingPeriodEnd < creationDate return a 0 finalBillAmount
        if (billingPeriodEnd < account!.creationDate) return billDTO;

        const iteratedDate = new Date(
            account!.creationDate > billingPeriodStart
                ? account!.creationDate
                : billingPeriodStart,
        );
        console.log(`account!.discountDays : ${account!.discountDays}`);
        let discountDaysRemaining =
            account!.discountDays -
            (iteratedDate.getTime() - account!.creationDate.getTime()) /
                millisecondsInADay;
        console.log(`iteratedDate.getTime() : ${iteratedDate.getTime()}`);
        console.log(
            `account!.creationDate.getTime() : ${account!.creationDate.getTime()}`,
        );
        console.log(`discountDaysRemaining : ${discountDaysRemaining}`);
        discountDaysRemaining =
            discountDaysRemaining > 0 ? discountDaysRemaining : 0;
        let discountDaysClaimed = 0;
        let activeDaysInMonth = 0;
        let daysInMonth = this.getDaysInMonth(iteratedDate);
        console.log(iteratedDate);
        let iteratingMonth = iteratedDate.getMonth();
        let iteratingYear = iteratedDate.getFullYear();
        let currentBill;
        // iterate days until billingPeriodEnd
        while (iteratedDate < billingPeriodEnd) {
            // if new month / year
            if (
                iteratedDate.getFullYear() > iteratingYear ||
                iteratedDate.getMonth() != iteratingMonth
            ) {
                currentBill = this.getCurrentBill(
                    iteratingYear,
                    iteratingMonth,
                    activeDaysInMonth,
                    daysInMonth,
                    currency as CreateCurrencyDTO,
                    discountDaysClaimed,
                    account as AccountDTO,
                );
                billDTO.periods.push(currentBill);
                console.log(iteratedDate);
                iteratingMonth = iteratedDate.getMonth();
                iteratingYear = iteratedDate.getFullYear();
                daysInMonth = this.getDaysInMonth(iteratedDate);
                activeDaysInMonth = 0;
                discountDaysClaimed = 0;
            }
            iteratedDate.setDate(iteratedDate.getDate() + 1);
            activeDaysInMonth++;
            if (discountDaysRemaining > 0) {
                discountDaysClaimed++;
            }
            discountDaysRemaining--;
        }
        currentBill = this.getCurrentBill(
            iteratingYear,
            iteratingMonth,
            activeDaysInMonth,
            daysInMonth,
            currency as CreateCurrencyDTO,
            discountDaysClaimed,
            account as AccountDTO,
        );
        billDTO.periods.push(currentBill);
        // now get total number of days that the bill covers
        const totalBillDays = this.getTotalBillDays(billDTO);
        // gives x transactions per day
        const transactionsPerDay =
            calculateAccountTotalBillDTO.transactionCount / totalBillDays;
        // can now calculate transactions per period

        billDTO.periods.forEach((element) => {
            const object = this.addTransactionFees(
                transactionsPerDay,
                activeDaysInMonth,
                account as AccountDTO,
                element.discountDaysClaimed,
            );
            element.transactionFee = object.transactionFee;
            element.discountAppliedTransactionFee = object.discountApplied;
        });
        // now sum the bill
        return billDTO;
    }

    private createPeriodString(
        iteratingYear: number,
        iteratingMonth: number,
    ): string {
        return `${iteratingYear.toString()}-${(iteratingMonth + 1).toString().padStart(2, '0')}`;
    }

    private accountExists(accountId: string): boolean {
        const existingAccount = this.accounts.find(
            (acc) => acc.accountId === accountId,
        );
        return !!existingAccount;
    }

    private getAccount(accountId: string): AccountDTO | undefined {
        return this.accounts.find((acc) => acc.accountId === accountId);
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
        account: AccountDTO,
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
                account!.discountRate) /
            100;
        currentBill.activeDaysInMonth = activeDaysInMonth;
        currentBill.daysInMonth = daysInMonth;
        return currentBill;
    }

    private makeNewCurrentBill(iteratingYear: number, iteratingMonth: number) {
        return {
            baseFee: 0,
            transactionFee: 0,
            discountAppliedBaseFee: 0,
            discountAppliedTransactionFee: 0,
            discountDaysClaimed: 0,
            activeDaysInMonth: 0,
            daysInMonth: 0,
            period: this.createPeriodString(iteratingYear, iteratingMonth),
        };
    }

    private getTotalBillDays(bill): number {
        return bill.periods.reduce((sum, p) => sum + p.activeDaysInMonth, 0);
    }

    private addTransactionFees(
        transactionsPerDay: number,
        activeDaysInMonth: number,
        account: AccountDTO,
        discountDaysClaimed: number,
    ) {
        const transactionsThisPeriod = transactionsPerDay * activeDaysInMonth;
        let transactionFee = 0;
        let discountApplied = 0;
        // did we exceed the threshold this period?
        if (account!.transactionThreshold < transactionsThisPeriod) {
            transactionFee =
                perTransactionFee *
                (transactionsThisPeriod - account!.transactionThreshold);
            const exceededThresholdOnDay = Math.ceil(
                account!.transactionThreshold / transactionsPerDay,
            );
            // did we exceed the threshold before discountDays elapsed
            if (discountDaysClaimed > exceededThresholdOnDay) {
                // apply discount to the fees for the discount days that exceed the exceededThresholdOnDay
                discountApplied =
                    ((discountDaysClaimed / activeDaysInMonth) *
                        transactionFee *
                        account!.discountRate) /
                    100;
            }
        }
        return { transactionFee, discountApplied };
    }
}
