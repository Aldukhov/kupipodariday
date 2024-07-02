import { IsNotEmpty, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  wishId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Amount must be at least 0.01' })
  @Max(999999.99, { message: 'Amount cannot exceed 999999.99' })
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  hidden: boolean;
}
