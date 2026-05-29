import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Delivery, DeliveryDocument } from './schema/delivery.schema';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(Delivery.name)
    private readonly deliveryModel: Model<DeliveryDocument>,
  ) {}

  create(createDeliveryDto: CreateDeliveryDto) {
    return this.deliveryModel.create(createDeliveryDto);
  }

  findAll() {
    return this.deliveryModel.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    try {
      const delivery = await this.deliveryModel.findById(id).exec();
      if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
      return delivery;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }

  async update(id: string, updateDeliveryDto: UpdateDeliveryDto) {
    try {
      const delivery = await this.deliveryModel
        .findByIdAndUpdate(id, updateDeliveryDto, { new: true })
        .exec();
      if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
      return delivery;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const delivery = await this.deliveryModel.findByIdAndDelete(id).exec();
      if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
      return delivery;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }
}
