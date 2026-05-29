import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsLatitude, IsLongitude, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'Nome do cliente', example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: 'Endereço de entrega', example: 'Av. Paulista, 1000 - São Paulo' })
  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @ApiProperty({ description: 'Latitude do endereço de entrega', example: -23.5505 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: 'Longitude do endereço de entrega', example: -46.6333 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ description: 'Pedido especial (prioridade na fila)', example: false })
  @IsBoolean()
  @IsOptional()
  isSpecial?: boolean;

  @ApiPropertyOptional({ description: 'Descrição do pedido especial', example: 'Sem glúten' })
  @IsString()
  @IsOptional()
  specialDescription?: string;

  @ApiProperty({ description: 'ID do restaurante', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @IsMongoId()
  restaurantId: string;
}
