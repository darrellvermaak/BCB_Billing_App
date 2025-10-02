import { Module } from '@nestjs/common';

import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrenciesModule } from './currencies/currencies.module';
import { CurrenciesService } from './currencies/currencies.service';

@Module({
    imports: [AccountsModule, CurrenciesModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
