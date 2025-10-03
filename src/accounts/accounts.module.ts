import { Module } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { CurrencyExistsConstraint } from './validators/currency-exists.decorator';
import { CurrenciesModule } from '../currencies/currencies.module';
import { CurrenciesService } from '../currencies/currencies.service';
import { GenerateBill } from './generate-bill';

@Module({
    imports: [CurrenciesModule],
    controllers: [AccountsController],
    providers: [AccountsService, CurrencyExistsConstraint],
})
export class AccountsModule {}
