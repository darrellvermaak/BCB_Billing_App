import { IsInt, IsISO8601, IsString, Min } from 'class-validator';

import { IsBefore } from '../validators/is-before.decorator';

export class CalculateAccountTotalBillDTO {
    @IsString()
    accountId: string;

    @IsISO8601()
    @IsBefore('billingPeriodEnd', {
        message: 'billingPeriodStart must be before billingPeriodEnd',
    })
    billingPeriodStart: string;

    @IsISO8601()
    billingPeriodEnd: string;

    @IsInt()
    @Min(0)
    transactionCount: number;
}
