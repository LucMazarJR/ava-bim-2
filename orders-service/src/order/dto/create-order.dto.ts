import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  declare customerName: string;

  @IsString()
  @IsNotEmpty()
  declare customerAddress: string;

  @IsLatitude()
  declare latitude: number;

  @IsLongitude()
  declare longitude: number;

  @IsBoolean()
  @IsOptional()
  isSpecial?: boolean;

  @IsString()
  @IsOptional()
  specialDescription?: string;

  @IsMongoId()
  declare restaurantId: string;
}
