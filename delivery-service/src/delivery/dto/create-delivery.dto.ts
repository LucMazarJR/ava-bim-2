import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateDeliveryDto {
  @IsMongoId()
  declare orderId: string;

  @IsString()
  @IsNotEmpty()
  declare originAddress: string;

  @IsString()
  @IsNotEmpty()
  declare destinationAddress: string;

  @IsNumber()
  @IsPositive()
  declare shippingCost: number;
}
