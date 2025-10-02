import { Module } from '@nestjs/common';

import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';

@Module({
    providers: [CurrenciesService],
    controllers: [CurrenciesController],
    exports: [CurrenciesService],
})
export class CurrenciesModule {}
