import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument, OrderStatus } from './schema/order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  create(createOrderDto: CreateOrderDto) {
    return this.orderModel.create(createOrderDto);
  }

  findAll() {
    return this.orderModel.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id).exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  /**
   * Retorna os pedidos pendentes/prontos ordenados por prioridade para a IA montar a rota:
   * 1. Pedidos especiais primeiro (isSpecial = true)
   * 2. Dentro de cada grupo, ordem de chegada (createdAt ASC)
   *
   * Cada item inclui coordenadas (latitude/longitude) para cálculo de rota.
   */
  getDeliveryRoute() {
    return this.orderModel
      .find({ status: { $in: [OrderStatus.PENDING, OrderStatus.READY] } })
      .sort({ isSpecial: -1, createdAt: 1 })
      .select(
        'customerName customerAddress latitude longitude isSpecial specialDescription restaurantId createdAt',
      )
      .exec();
  }
}
