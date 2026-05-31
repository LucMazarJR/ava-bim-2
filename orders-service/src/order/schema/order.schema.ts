import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  IN_DELIVERY = 'IN_DELIVERY',
  DELIVERED = 'DELIVERED',
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({ required: true })
  declare customerName: string;

  @Prop({ required: true })
  declare customerAddress: string;

  @Prop({ required: true })
  declare latitude: number;

  @Prop({ required: true })
  declare longitude: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  declare status: OrderStatus;

  @Prop({
    default: false,
  })
  declare isSpecial: boolean;

  @Prop()
  specialDescription?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Restaurant',
  })
  declare restaurantId: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
