import { IsNumber, IsString, Min } from 'class-validator';

export class CreateCurrencyDTO {
    @IsString()
    currency: string;

    @IsNumber()
    @Min(0)
    monthlyFeeGbp: number;
}
