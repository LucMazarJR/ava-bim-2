import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from './create-restaurant.dto';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({ example: 'Pizzaria do João' })
  name?: string;

  @ApiPropertyOptional({ example: 'As melhores pizzas da cidade' })
  description?: string;

  @ApiPropertyOptional({ type: CreateAddressDto })
  address?: CreateAddressDto;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  phone?: string;

  @ApiPropertyOptional({ example: true })
  isOpen?: boolean;

  @ApiPropertyOptional({ description: 'ID do dono do restaurante', example: '664f1b2e8f1a2b3c4d5em6f7a' })
  ownerId?: string;
}
