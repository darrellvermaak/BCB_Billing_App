import { Body, Controller, Param, Post } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';
import { CreateAccountDTO } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    create(
        @Body()
        newAccount: CreateAccountDTO,
    ) {
        return this.accountsService.create(newAccount);
    }

    @Post(':accountId/bill')
    createBill(
        @Param('accountId') accountId: string,
        @Body()
        calculateAccountTotalBillDTOwithoutAccountId: Omit<
            CalculateAccountTotalBillDTO,
            'accountId'
        >,
    ) {
        const calculateAccountTotalBillDTO: CalculateAccountTotalBillDTO = {
            accountId,
            ...calculateAccountTotalBillDTOwithoutAccountId,
        };
        return this.accountsService.calculateTotalBill(
            calculateAccountTotalBillDTO,
        );
    }
}
