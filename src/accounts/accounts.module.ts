import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Module({
    controllers: [],
    providers: [AccountsService]
})
export class AccountsModule { }
