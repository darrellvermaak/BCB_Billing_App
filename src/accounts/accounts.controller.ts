import { Body, Controller, Param, Post } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';
import { AccountDTO } from './dto/account.dto';
import { CreateAccountDTO } from './dto/create-account.dto';
import { CalculateAccountTotalBillWithoutIdDTO } from './dto/calculate-account-total-bill-without-id.dto';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    create(
        @Body()
        newAccountDTOwithoutCreationDate: CreateAccountDTO,
    ) {
        const newAccountDTO: AccountDTO = {
            creationDate: new Date(),
            ...newAccountDTOwithoutCreationDate,
        };
        return this.accountsService.create(newAccountDTO);
    }

    @Post(':accountId/bill')
    createBill(
        @Param('accountId') accountId: string,
        @Body()
        calculateAccountTotalBillDTOwithoutAccountId: CalculateAccountTotalBillWithoutIdDTO,
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
