import { Test, TestingModule } from '@nestjs/testing';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CurrenciesService } from '../currencies/currencies.service';

describe('AccountsController', () => {
    let controller: AccountsController;

    const mockAccountsService = {
        // Add mock methods as needed, e.g.:
        // findAll: jest.fn().mockResolvedValue([]),
    };

    const mockCurrenciesService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AccountsController],
            providers: [
                {
                    provide: AccountsService,
                    useValue: mockAccountsService,
                },
                {
                    provide: CurrenciesService,
                    useValue: mockCurrenciesService,
                },
            ],
        }).compile();

        controller = module.get<AccountsController>(AccountsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
