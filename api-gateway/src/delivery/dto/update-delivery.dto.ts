import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateDeliveryDto {
  @ApiPropertyOptional({ description: 'ID do pedido associado', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  orderId?: string;

  @ApiPropertyOptional({ description: 'Endereço de origem', example: 'Rua das Flores, 123 - São Paulo' })
  originAddress?: string;

  @ApiPropertyOptional({ description: 'Endereço de destino', example: 'Av. Paulista, 1000 - São Paulo' })
  destinationAddress?: string;

  @ApiPropertyOptional({ description: 'Custo do frete em reais', example: 12.5 })
  shippingCost?: number;

  @ApiPropertyOptional({ enum: DeliveryStatus, description: 'Status da entrega' })
  status?: DeliveryStatus;
}
