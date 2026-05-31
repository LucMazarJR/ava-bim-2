import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Nome do cliente', example: 'João Silva' })
  customerName: string;

  @ApiProperty({ description: 'Endereço de entrega', example: 'Av. Paulista, 1000 - São Paulo' })
  customerAddress: string;

  @ApiProperty({ description: 'Latitude do endereço de entrega', example: -23.5505 })
  latitude: number;

  @ApiProperty({ description: 'Longitude do endereço de entrega', example: -46.6333 })
  longitude: number;

  @ApiPropertyOptional({ description: 'Pedido especial (prioridade na fila)', example: false })
  isSpecial?: boolean;

  @ApiPropertyOptional({ description: 'Descrição do pedido especial', example: 'Sem glúten' })
  specialDescription?: string;

  @ApiProperty({ description: 'ID do restaurante', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  restaurantId: string;
}
