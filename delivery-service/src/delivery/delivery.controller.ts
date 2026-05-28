import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryService } from './delivery.service';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return await this.deliveryService.create(createDeliveryDto);
  }

  @Get()
  async findAll() {
    return await this.deliveryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.deliveryService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return await this.deliveryService.update(id, updateDeliveryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.deliveryService.remove(id);
  }
}
