import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCurrencyDTO } from './dto/create-currency.dto';

@Injectable()
export class CurrenciesService {
    private currencies: CreateCurrencyDTO[] = [];

    create(currency: CreateCurrencyDTO) {
        const existingCurrency = this.currencyExists(currency.currency);
        if (existingCurrency) {
            throw new ConflictException(
                'Currency with this code already exists',
            );
        }
        this.currencies.push(currency);
        return currency;
    }

    currencyExists(currency: string): boolean {
        const existingCurrency = this.currencies.find(
            (cur) => cur.currency === currency,
        );
        return !!existingCurrency;
    }

    getCurrency(currency: string): CreateCurrencyDTO | undefined {
        return this.currencies.find((cur) => cur.currency === currency);
    }
}
