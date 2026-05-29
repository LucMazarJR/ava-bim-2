import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Rua das Flores, 123' })
  street: string;

  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @ApiProperty({ example: 'SP' })
  state: string;

  @ApiPropertyOptional({ example: -23.5505 })
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6333 })
  longitude?: number;
}

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Pizzaria do João' })
  name: string;

  @ApiPropertyOptional({ example: 'As melhores pizzas da cidade' })
  description?: string;

  @ApiProperty({ type: CreateAddressDto })
  address: CreateAddressDto;

  @ApiProperty({ example: '(11) 99999-9999' })
  phone: string;

  @ApiPropertyOptional({ example: false })
  isOpen?: boolean;

  @ApiProperty({ description: 'ID do dono do restaurante', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  ownerId: string;
}
