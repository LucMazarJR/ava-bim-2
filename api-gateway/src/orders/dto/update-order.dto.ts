import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Nome do cliente', example: 'João Silva' })
  customerName?: string;

  @ApiPropertyOptional({ description: 'Endereço de entrega', example: 'Av. Paulista, 1000 - São Paulo' })
  customerAddress?: string;

  @ApiPropertyOptional({ description: 'Latitude do endereço de entrega', example: -23.5505 })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude do endereço de entrega', example: -46.6333 })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Pedido especial (prioridade na fila)', example: false })
  isSpecial?: boolean;

  @ApiPropertyOptional({ description: 'Descrição do pedido especial', example: 'Sem glúten' })
  specialDescription?: string;

  @ApiPropertyOptional({ description: 'ID do restaurante', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  restaurantId?: string;
}
