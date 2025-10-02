import { Test, TestingModule } from '@nestjs/testing';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CurrenciesService } from '../currencies/currencies.service';

describe('AccountsController', () => {
    let controller: AccountsController;
    let accountsService: AccountsService;

    const mockAccountsService = {
        create: jest.fn(),
        calculateTotalBill: jest.fn(),
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
        accountsService = module.get<AccountsService>(AccountsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call accountsService.create with the correct DTO and return the result', async () => {
            const dto = {
                currency: 'USD',
                transactionThreshold: 0,
                discountDays: 10,
                discountRate: 15,
                creationDate: new Date(),
            };
            const result = { accountId: '1', ...dto };
            mockAccountsService.create.mockResolvedValue(result);

            await expect(controller.create(dto as any)).resolves.toEqual(
                result,
            );
            expect(mockAccountsService.create).toHaveBeenCalledWith(dto);
        });

        it('should propagate errors from accountsService.create', async () => {
            const dto = { name: 'Test Account', currency: 'USD' };
            mockAccountsService.create.mockRejectedValue(
                new Error('Create failed'),
            );

            await expect(controller.create(dto as any)).rejects.toThrow(
                'Create failed',
            );
        });
    });

    describe('createBill', () => {
        it('should call accountsService.calculateTotalBill with the correct DTO and return the result', async () => {
            const accountId = 'abc123';
            const billDtoWithoutId = { amount: 100, currency: 'USD' };
            const expectedDto = { accountId, ...billDtoWithoutId };
            const result = { total: 120, currency: 'USD' };
            mockAccountsService.calculateTotalBill.mockResolvedValue(result);

            await expect(
                controller.createBill(accountId, billDtoWithoutId as any),
            ).resolves.toEqual(result);
            expect(mockAccountsService.calculateTotalBill).toHaveBeenCalledWith(
                expectedDto,
            );
        });

        it('should propagate errors from accountsService.calculateTotalBill', async () => {
            const accountId = 'abc123';
            const billDtoWithoutId = { amount: 100, currency: 'USD' };
            mockAccountsService.calculateTotalBill.mockRejectedValue(
                new Error('Calculation failed'),
            );

            await expect(
                controller.createBill(accountId, billDtoWithoutId as any),
            ).rejects.toThrow('Calculation failed');
        });
    });
});
