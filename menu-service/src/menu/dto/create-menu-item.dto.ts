import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'X-Burguer', description: 'Nome do item' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Pão, carne 150g, queijo e alface',
    description: 'Descrição do item',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ example: 25.9, description: 'Preço em reais' })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 'Lanches', description: 'Categoria do item' })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiProperty({
    example: '664f1b2e8f1a2b3c4d5e6f7a',
    description: 'ID do restaurante dono do item',
  })
  @IsNotEmpty()
  @IsString()
  restaurantId!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Se o item está disponível',
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
