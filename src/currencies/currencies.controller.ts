import { Body, Controller, Post } from '@nestjs/common';

@Controller('currencies')
export class CurrenciesController {
    @Post() // POST /currencies
    create(@Body() currency: { currency: 'string'; monthlyFeeGbp: 'number' }) {
        return currency;
    }
}
