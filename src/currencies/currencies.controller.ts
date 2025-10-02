import { Body, Controller, Post } from '@nestjs/common';

import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDTO } from './dto/create-currency.dto';

@Controller('currencies')
export class CurrenciesController {
    constructor(private readonly currenciesService: CurrenciesService) {}

    @Post() // POST /currencies
    create(@Body() newCurrency: CreateCurrencyDTO) {
        return this.currenciesService.create(newCurrency);
    }
}
