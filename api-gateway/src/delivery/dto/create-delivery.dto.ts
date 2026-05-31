import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryDto {
  @ApiProperty({ description: 'ID do pedido associado', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  orderId: string;

  @ApiProperty({ description: 'Endereço de origem', example: 'Rua das Flores, 123 - São Paulo' })
  originAddress: string;

  @ApiProperty({ description: 'Endereço de destino', example: 'Av. Paulista, 1000 - São Paulo' })
  destinationAddress: string;

  @ApiProperty({ description: 'Custo do frete em reais', example: 12.5 })
  shippingCost: number;
}
