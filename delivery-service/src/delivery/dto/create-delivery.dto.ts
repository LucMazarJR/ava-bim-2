import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({ description: 'ID do pedido associado', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @IsMongoId()
  declare orderId: string;

  @ApiProperty({ description: 'Endereço de origem', example: 'Rua das Flores, 123 - São Paulo' })
  @IsString()
  @IsNotEmpty()
  declare originAddress: string;

  @ApiProperty({ description: 'Endereço de destino', example: 'Av. Paulista, 1000 - São Paulo' })
  @IsString()
  @IsNotEmpty()
  declare destinationAddress: string;

  @ApiProperty({ description: 'Custo do frete em reais', example: 12.5 })
  @IsNumber()
  @IsPositive()
  declare shippingCost: number;
}
