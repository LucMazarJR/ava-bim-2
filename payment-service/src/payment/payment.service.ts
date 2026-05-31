import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model, Types } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { Payment, PaymentDocument, PaymentStatus } from './schema/payment.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const existing = await this.paymentModel.findOne({
      orderId: new Types.ObjectId(createPaymentDto.orderId),
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.CONFIRMED] },
    });
    if (existing) {
      throw new BadRequestException('Já existe um pagamento ativo para este pedido.');
    }
    return this.paymentModel.create(createPaymentDto);
  }

  findAll() {
    return this.paymentModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    try {
      const payment = await this.paymentModel.findById(id).exec();
      if (!payment) throw new NotFoundException(`Payment ${id} not found`);
      return payment;
    } catch (error) {
      if (error instanceof Error.CastError) throw new BadRequestException('Id inválido');
      throw error;
    }
  }

  async findByOrder(orderId: string) {
    try {
      const payment = await this.paymentModel
        .findOne({ orderId: new Types.ObjectId(orderId) })
        .sort({ createdAt: -1 })
        .exec();
      if (!payment) throw new NotFoundException(`Nenhum pagamento encontrado para o pedido ${orderId}`);
      return payment;
    } catch (error) {
      if (error instanceof Error.CastError) throw new BadRequestException('Id inválido');
      throw error;
    }
  }

  async process(id: string, processPaymentDto: ProcessPaymentDto) {
    try {
      const payment = await this.paymentModel.findById(id).exec();
      if (!payment) throw new NotFoundException(`Payment ${id} not found`);

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException(
          `Pagamento não pode ser processado. Status atual: ${payment.status}`,
        );
      }

      const updated = await this.paymentModel
        .findByIdAndUpdate(id, { $set: processPaymentDto }, { new: true })
        .exec();

      return updated;
    } catch (error) {
      if (error instanceof Error.CastError) throw new BadRequestException('Id inválido');
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const payment = await this.paymentModel.findById(id).exec();
      if (!payment) throw new NotFoundException(`Payment ${id} not found`);

      if (payment.status === PaymentStatus.CONFIRMED) {
        throw new BadRequestException('Pagamentos confirmados não podem ser removidos. Use o estorno.');
      }

      return this.paymentModel.findByIdAndDelete(id).exec();
    } catch (error) {
      if (error instanceof Error.CastError) throw new BadRequestException('Id inválido');
      throw error;
    }
  }
}
