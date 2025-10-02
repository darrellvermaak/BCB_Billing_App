import { Test, TestingModule } from '@nestjs/testing';

import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';

describe('CurrenciesController', () => {
    let controller: CurrenciesController;

    const mockCurrenciesService = {
        // Add mock methods as needed, e.g.:
        // findAll: jest.fn().mockResolvedValue([]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CurrenciesController],
            providers: [
                {
                    provide: CurrenciesService,
                    useValue: mockCurrenciesService,
                },
            ],
        }).compile();

        controller = module.get<CurrenciesController>(CurrenciesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
