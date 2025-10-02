import { Test, TestingModule } from '@nestjs/testing';

import { AccountsService } from './accounts.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AccountDTO } from './dto/account.dto';
import { CalculateAccountTotalBillDTO } from './dto/calculate-account-total-bill.dto';

describe('AccountsService', () => {
    let service: AccountsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccountsService],
        }).compile();

        service = module.get<AccountsService>(AccountsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new account successfully', () => {
            const account: AccountDTO = {
                accountId: '1',
                currency: 'GBP',
                discountDays: 0,
                discountRate: 10,
                transactionThreshold: 10,
                creationDate: new Date(),
            };
            const result = service.create(account);
            expect(result).toEqual(account);
        });

        it('should throw ConflictException if account already exists', () => {
            const account: AccountDTO = {
                accountId: '1',
                currency: 'GBP',
                discountDays: 0,
                discountRate: 10,
                transactionThreshold: 10,
                creationDate: new Date(),
            };
            service.create(account);
            expect(() => service.create(account)).toThrow(ConflictException);
        });
    });

    describe('calculateTotalBill', () => {
        it('should return the DTO if account exists', () => {
            const account: AccountDTO = {
                accountId: '3',
                currency: 'GBP',
                discountDays: 0,
                discountRate: 10,
                transactionThreshold: 10,
                creationDate: new Date(),
            };
            service.create(account);
            const dto: CalculateAccountTotalBillDTO = {
                accountId: '3',
                billingPeriodEnd: '2025-01-31',
                billingPeriodStart: '2025-01-01',
                transactionCount: 20,
            };
            const result = service.calculateTotalBill(dto);
            expect(result).toEqual(dto);
        });

        it('should throw BadRequestException if account does not exist', () => {
            const dto: CalculateAccountTotalBillDTO = {
                accountId: '999',
                billingPeriodEnd: '2025-01-31',
                billingPeriodStart: '2025-01-01',
                transactionCount: 20,
            };
            expect(() => service.calculateTotalBill(dto)).toThrow(
                BadRequestException,
            );
        });
    });

    describe('accountExists (private)', () => {
        it('should return true if account exists', () => {
            const account: AccountDTO = {
                accountId: '4',
                currency: 'GBP',
                discountDays: 0,
                discountRate: 10,
                transactionThreshold: 10,
                creationDate: new Date(),
            };
            service.create(account);
            // @ts-ignore: Accessing private method for test coverage
            expect(service['accountExists']('4')).toBe(true);
        });

        it('should return false if account does not exist', () => {
            // @ts-ignore: Accessing private method for test coverage
            expect(service['accountExists']('not-exist')).toBe(false);
        });
    });
});
