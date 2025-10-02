import { Injectable, ConflictException } from '@nestjs/common';

import { CreateAccountDTO } from './dto/create-account.dto';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';

@Injectable()
export class AccountsService {
    private accounts: CreateAccountDTO[] = [];

    create(account: CreateAccountDTO) {
        const existingAccount = this.accounts.find(
            (acc) => acc.accountId === account.accountId,
        );
        if (existingAccount) {
            throw new ConflictException('Account with this ID already exists');
        }
        this.accounts.push(account);
        return account;
    }

    calculateTotalBill(
        calculateAccountTotalBillDTO: CalculateAccountTotalBillDTO,
    ) {
        const account = this.accounts.find(
            (acc) => acc.accountId === calculateAccountTotalBillDTO.accountId,
        );
        if (!account) {
            throw new Error('Account not found');
        }

        return calculateAccountTotalBillDTO;
    }
}
