import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateDeliveryDto } from './create-delivery.dto';
import { DeliveryStatus } from '../schema/delivery.schema';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @IsEnum(DeliveryStatus)
  @IsOptional()
  status?: DeliveryStatus;
}
