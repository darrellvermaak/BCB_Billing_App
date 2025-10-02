import { validate, ValidationError } from 'class-validator';
import { IsBefore } from './is-before.decorator';

class TestDto {
    @IsBefore('endDate', { message: 'startDate must be before endDate' })
    startDate: string;

    endDate: string;
}

describe('IsBefore Decorator', () => {
    it('should pass when startDate is before endDate', async () => {
        const dto = new TestDto();
        dto.startDate = '2023-01-01T00:00:00.000Z';
        dto.endDate = '2023-01-02T00:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail when startDate is after endDate', async () => {
        const dto = new TestDto();
        dto.startDate = '2023-01-03T00:00:00.000Z';
        dto.endDate = '2023-01-02T00:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toHaveProperty('isBefore');
        expect(errors[0].constraints?.isBefore).toBe(
            'startDate must be before endDate',
        );
    });

    it('should fail when startDate is equal to endDate', async () => {
        const dto = new TestDto();
        dto.startDate = '2023-01-02T00:00:00.000Z';
        dto.endDate = '2023-01-02T00:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBe(1);
        expect(errors[0].constraints).toHaveProperty('isBefore');
    });

    it('should pass when startDate is undefined', async () => {
        const dto = new TestDto();
        dto.startDate = undefined as any;
        dto.endDate = '2023-01-02T00:00:00.000Z';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass when endDate is undefined', async () => {
        const dto = new TestDto();
        dto.startDate = '2023-01-01T00:00:00.000Z';
        dto.endDate = undefined as any;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should pass when both dates are undefined', async () => {
        const dto = new TestDto();
        dto.startDate = undefined as any;
        dto.endDate = undefined as any;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});
