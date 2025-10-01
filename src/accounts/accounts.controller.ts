import { Body, Controller, Param, Post } from '@nestjs/common';

@Controller('accounts')
export class AccountsController {
    /*
    POST /accounts/:accountId/bill
    */
    @Post() // POST /accounts create new account - payload { "accountId": "string", "currency": "string", "transactionThreshold": "number", "discountDays": "number", "discountRate": "number" }
    create(
        @Body()
        account: {
            accountId: 'string';
            currency: 'string';
            transactionThreshold: 'number';
            discountDays: 'number';
            discountRate: 'number';
        },
    ) {
        return account;
    }

    @Post(':accountId/bill') // POST /accounts/:accountId/bill
    createBill(@Param('accountId') accountId: string) {
        return { accountId };
    }
}
