import {
    IsInt,
    IsNumber,
    IsString,
    Min,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    Validate,
    IsDate,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

import { CurrenciesService } from '../../currencies/currencies.service';
import { CurrencyExists } from '../validators/currency-exists.decorator';

export class AccountDTO {
    @IsString()
    accountId: string;

    @IsString()
    @CurrencyExists({
        message: 'Currency does not exist',
    })
    currency: string;

    @IsInt()
    @Min(0)
    transactionThreshold: number;

    @IsInt()
    @Min(0)
    discountDays: number;

    @IsNumber()
    @Min(0)
    discountRate: number;

    @IsDate()
    creationDate: Date;
}
