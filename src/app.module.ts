import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrenciesModule } from './currencies/currencies.module';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsModule } from './accounts/accounts.module';

@Module({
    imports: [AccountsModule, CurrenciesModule],
    controllers: [AccountsController, AppController],
    providers: [AppService],
})
export class AppModule { }
