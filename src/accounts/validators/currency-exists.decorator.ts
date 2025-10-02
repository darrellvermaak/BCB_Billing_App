import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator,
    ValidationOptions,
    useContainer,
} from 'class-validator';

import { CurrenciesService } from '../../currencies/currencies.service';
@ValidatorConstraint({ async: true })
@Injectable()
export class CurrencyExistsConstraint implements ValidatorConstraintInterface {
    constructor(private readonly currenciesService: CurrenciesService) {}

    async validate(value: any, args: ValidationArguments) {
        if (!this.currenciesService) {
            throw new Error(
                'CurrenciesService is not injected. Make sure to call useContainer(app.select(AppModule), { fallbackOnErrors: true }) in your main.ts',
            );
        }
        console.log(`currency being validated : ${value}`);
        return this.currenciesService.currencyExists(value);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Currency does not exist';
    }
}

export function CurrencyExists(validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: CurrencyExistsConstraint,
        });
    };
}
