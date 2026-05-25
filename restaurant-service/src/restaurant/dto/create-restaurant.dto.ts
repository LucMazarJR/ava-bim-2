import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsNotEmpty()
  @IsString()
  street!: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsNotEmpty()
  @IsString()
  city!: string;

  @ApiProperty({ example: 'SP' })
  @IsNotEmpty()
  @IsString()
  state!: string;

  @ApiPropertyOptional({ example: -23.5505 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6333 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Pizzaria do João' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'As melhores pizzas da cidade' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: CreateAddressDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address!: CreateAddressDto;

  @ApiProperty({ example: '(11) 99999-9999' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiProperty({ example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @IsNotEmpty()
  @IsString()
  ownerId!: string;
}
