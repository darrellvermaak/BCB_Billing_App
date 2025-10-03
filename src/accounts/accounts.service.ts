import {
    Injectable,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';

import { AccountDTO } from './dto/account.dto';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { CreateCurrencyDTO } from 'src/currencies/dto/create-currency.dto';
import { GenerateBill } from './generate-bill';

@Injectable()
export class AccountsService {
    constructor(private currenciesService: CurrenciesService) {}

    private generateBill = new GenerateBill();
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

        const account = this.getAccount(calculateAccountTotalBillDTO.accountId);
        const currency = this.currenciesService.getCurrency(account!.currency);

        return this.generateBill.Generate(
            account as AccountDTO,
            currency as CreateCurrencyDTO,
            calculateAccountTotalBillDTO,
        );
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
}
