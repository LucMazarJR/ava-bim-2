import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DeliveryController } from './delivery.controller';

@Module({
  imports: [HttpModule],
  controllers: [DeliveryController],
})
export class DeliveryModule {}
