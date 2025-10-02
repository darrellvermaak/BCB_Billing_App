import { CurrencyExistsConstraint } from './currency-exists.decorator';
import { CurrenciesService } from '../../currencies/currencies.service';
import { ValidationArguments } from 'class-validator';

describe('CurrencyExistsConstraint', () => {
    let currenciesService: CurrenciesService;
    let constraint: CurrencyExistsConstraint;

    beforeEach(() => {
        currenciesService = {
            currencyExists: jest.fn(),
        } as any;
        constraint = new CurrencyExistsConstraint(currenciesService);
    });

    it('should return true if currency exists (positive test)', async () => {
        (currenciesService.currencyExists as jest.Mock).mockResolvedValue(true);
        const result = await constraint.validate(
            'USD',
            {} as ValidationArguments,
        );
        expect(result).toBe(true);
        expect(currenciesService.currencyExists).toHaveBeenCalledWith('USD');
    });

    it('should return false if currency does not exist (negative test)', async () => {
        (currenciesService.currencyExists as jest.Mock).mockResolvedValue(
            false,
        );
        const result = await constraint.validate(
            'XYZ',
            {} as ValidationArguments,
        );
        expect(result).toBe(false);
        expect(currenciesService.currencyExists).toHaveBeenCalledWith('XYZ');
    });

    it('should throw error if currenciesService is not injected', async () => {
        const brokenConstraint = new CurrencyExistsConstraint(undefined as any);
        await expect(
            brokenConstraint.validate('USD', {} as ValidationArguments),
        ).rejects.toThrow(
            'CurrenciesService is not injected. Make sure to call useContainer(app.select(AppModule), { fallbackOnErrors: true }) in your main.ts',
        );
    });

    it('should return default error message', () => {
        const message = constraint.defaultMessage({} as ValidationArguments);
        expect(message).toBe('Currency does not exist');
    });
});
