import { validate } from 'class-validator';
import { AccountDTO } from './account.dto';

// Mock the CurrencyExists decorator to always pass or fail for testing
jest.mock('../validators/currency-exists.decorator', () => ({
    CurrencyExists: (options: any) => () => {},
}));

describe('CreateAccountDTO', () => {
    let dto: AccountDTO;

    beforeEach(() => {
        dto = new AccountDTO();
        dto.accountId = 'acc-123';
        dto.currency = 'USD';
        dto.transactionThreshold = 1000;
        dto.discountDays = 30;
        dto.discountRate = 0.05;
        dto.creationDate = new Date();
    });

    it('should validate a valid DTO', async () => {
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if accountId is not a string', async () => {
        // @ts-ignore
        dto.accountId = 123;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'accountId')).toBe(true);
    });

    it('should fail if currency is not a string', async () => {
        // @ts-ignore
        dto.currency = 123;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'currency')).toBe(true);
    });

    it('should fail if transactionThreshold is negative', async () => {
        dto.transactionThreshold = -1;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'transactionThreshold')).toBe(
            true,
        );
    });

    it('should fail if transactionThreshold is not an integer', async () => {
        // @ts-ignore
        dto.transactionThreshold = 10.5;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'transactionThreshold')).toBe(
            true,
        );
    });

    it('should fail if discountDays is negative', async () => {
        dto.discountDays = -5;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'discountDays')).toBe(true);
    });

    it('should fail if discountDays is not an integer', async () => {
        // @ts-ignore
        dto.discountDays = 2.5;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'discountDays')).toBe(true);
    });

    it('should fail if discountRate is negative', async () => {
        dto.discountRate = -0.01;
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'discountRate')).toBe(true);
    });

    it('should fail if discountRate is not a number', async () => {
        // @ts-ignore
        dto.discountRate = 'not-a-number';
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'discountRate')).toBe(true);
    });

    it('should fail if required fields are missing', async () => {
        const emptyDto = new AccountDTO();
        const errors = await validate(emptyDto);
        expect(errors.length).toBeGreaterThan(0);
        const props = errors.map((e) => e.property);
        expect(props).toEqual(
            expect.arrayContaining([
                'accountId',
                'currency',
                'transactionThreshold',
                'discountDays',
                'discountRate',
            ]),
        );
    });
});
