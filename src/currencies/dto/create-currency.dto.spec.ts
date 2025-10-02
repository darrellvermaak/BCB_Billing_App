import { validate } from 'class-validator';
import { CreateCurrencyDTO } from './create-currency.dto';

describe('CreateCurrencyDTO', () => {
    it('should validate a correct DTO', async () => {
        const dto = new CreateCurrencyDTO();
        dto.currency = 'GBP';
        dto.monthlyFeeGbp = 10;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if currency is not a string', async () => {
        const dto = new CreateCurrencyDTO();
        // @ts-expect-error
        dto.currency = 123;
        dto.monthlyFeeGbp = 10;

        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'currency')).toBe(true);
    });

    it('should fail if monthlyFeeGbp is not a number', async () => {
        const dto = new CreateCurrencyDTO();
        dto.currency = 'USD';
        // @ts-expect-error
        dto.monthlyFeeGbp = 'not-a-number';

        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'monthlyFeeGbp')).toBe(true);
    });

    it('should fail if monthlyFeeGbp is negative', async () => {
        const dto = new CreateCurrencyDTO();
        dto.currency = 'EUR';
        dto.monthlyFeeGbp = -5;

        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'monthlyFeeGbp')).toBe(true);
    });

    it('should fail if currency is missing', async () => {
        const dto = new CreateCurrencyDTO();
        dto.monthlyFeeGbp = 10;

        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'currency')).toBe(true);
    });

    it('should fail if monthlyFeeGbp is missing', async () => {
        const dto = new CreateCurrencyDTO();
        dto.currency = 'JPY';

        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'monthlyFeeGbp')).toBe(true);
    });

    it('should pass if monthlyFeeGbp is zero', async () => {
        const dto = new CreateCurrencyDTO();
        dto.currency = 'CHF';
        dto.monthlyFeeGbp = 0;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});
