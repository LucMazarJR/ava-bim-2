import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateDeliveryDto } from './create-delivery.dto';
import { DeliveryStatus } from '../schema/delivery.schema';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @ApiPropertyOptional({ enum: DeliveryStatus, description: 'Status da entrega' })
  @IsEnum(DeliveryStatus)
  @IsOptional()
  status?: DeliveryStatus;
}
