import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RestaurantController } from './restaurant.controller';

@Module({
  imports: [HttpModule],
  controllers: [RestaurantController],
})
export class RestaurantModule {}
