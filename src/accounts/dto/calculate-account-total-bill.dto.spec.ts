import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CalculateAccountTotalBillDTO } from './calculate-account-total-bill.dto';

describe('CalculateAccountTotalBillDTO', () => {
    it('✅ should validate a correct DTO', async () => {
        const dto = plainToInstance(CalculateAccountTotalBillDTO, {
            accountId: 'acc123',
            billingPeriodStart: '2025-09-01T00:00:00Z',
            billingPeriodEnd: '2025-09-30T23:59:59Z',
            transactionCount: 10,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('❌ should fail if billingPeriodStart is after billingPeriodEnd', async () => {
        const dto = plainToInstance(CalculateAccountTotalBillDTO, {
            accountId: 'acc123',
            billingPeriodStart: '2025-10-10T00:00:00Z',
            billingPeriodEnd: '2025-10-01T00:00:00Z',
            transactionCount: 5,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty(
            'isBefore',
            'billingPeriodStart must be before billingPeriodEnd',
        );
    });

    it('❌ should fail if billingPeriodStart is not ISO 8601', async () => {
        const dto = plainToInstance(CalculateAccountTotalBillDTO, {
            accountId: 'acc123',
            billingPeriodStart: '10/01/2025', // ❌ not ISO 8601
            billingPeriodEnd: '2025-10-31T00:00:00Z',
            transactionCount: 2,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isIso8601');
    });

    it('❌ should fail if transactionCount is negative', async () => {
        const dto = plainToInstance(CalculateAccountTotalBillDTO, {
            accountId: 'acc123',
            billingPeriodStart: '2025-10-01T00:00:00Z',
            billingPeriodEnd: '2025-10-31T00:00:00Z',
            transactionCount: -1,
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('min');
    });
});
