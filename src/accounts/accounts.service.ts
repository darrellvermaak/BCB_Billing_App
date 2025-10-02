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
                discountApplied: number;
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
        let currentBill = {
            baseFee: 0,
            transactionFee: 0,
            discountApplied: 0,
            discountDaysClaimed: 0,
            activeDaysInMonth: 0,
            daysInMonth: 0,
            period: this.createPeriodString(iteratingYear, iteratingMonth),
        };
        // iterate days until billingPeriodEnd
        while (iteratedDate < billingPeriodEnd) {
            // if new month / year
            if (
                iteratedDate.getFullYear() > iteratingYear ||
                iteratedDate.getMonth() != iteratingMonth
            ) {
                // currentBill.baseFee =
                //     (activeDaysInMonth / daysInMonth) * currency!.monthlyFeeGbp;
                // currentBill.discountDaysClaimed = discountDaysClaimed;
                // currentBill.transactionFee = 0;
                // currentBill.discountApplied =
                //     ((discountDaysClaimed / activeDaysInMonth) *
                //         currentBill.baseFee *
                //         account!.discountRate) /
                //     100;
                // currentBill.activeDaysInMonth = activeDaysInMonth;
                // currentBill.daysInMonth = daysInMonth;
                // console.log(`daysInMonth : ${daysInMonth}`);
                // console.log(`activeDaysInMonth : ${activeDaysInMonth}`);
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
                currentBill = {
                    baseFee: 0,
                    transactionFee: 0,
                    discountApplied: 0,
                    discountDaysClaimed: 0,
                    activeDaysInMonth: 0,
                    daysInMonth: 0,
                    period: this.createPeriodString(
                        iteratingYear,
                        iteratingMonth,
                    ),
                };
            }
            // if billingPeriodStart < creationDate + discountDays then apply discount to monthlyFeeGbp and transaction fee
            //          calculate monthlyFee and transactionFees for each portion of month up to earliest of month end or billingPeriodEnd
            iteratedDate.setDate(iteratedDate.getDate() + 1);
            activeDaysInMonth++;
            if (discountDaysRemaining > 0) {
                discountDaysClaimed++;
            }
            discountDaysRemaining--;
        }
        billDTO.periods.push(currentBill);
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
        currentBill.discountApplied =
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
            discountApplied: 0,
            discountDaysClaimed: 0,
            activeDaysInMonth: 0,
            daysInMonth: 0,
            period: this.createPeriodString(iteratingYear, iteratingMonth),
        };
    }
}
