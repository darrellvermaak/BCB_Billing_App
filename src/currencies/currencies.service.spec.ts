import { Test, TestingModule } from '@nestjs/testing';

import { CurrenciesService } from './currencies.service';

describe('CurrenciesService', () => {
    let service: CurrenciesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CurrenciesService],
        }).compile();

        service = module.get<CurrenciesService>(CurrenciesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should create a new currency successfully', () => {
        const currency = { currency: 'USD', monthlyFeeGbp: 10 };
        const result = service.create(currency);
        expect(result).toEqual(currency);
        expect(service['currencies']).toContainEqual(currency);
    });

    it('should throw ConflictException when creating a duplicate currency', () => {
        const currency = { currency: 'USD', monthlyFeeGbp: 10 };
        service.create(currency);
        expect(() => service.create(currency)).toThrow(
            'Currency with this code already exists',
        );
    });

    it('currencyExists should return true if currency exists', () => {
        const currency = { currency: 'EUR', monthlyFeeGbp: 11 };
        service.create(currency);
        expect(service.currencyExists('EUR')).toBe(true);
    });

    it('currencyExists should return false if currency does not exist', () => {
        expect(service.currencyExists('JPY')).toBe(false);
    });
});
