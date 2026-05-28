import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeliveryDocument = HydratedDocument<Delivery>;

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Delivery {
  @Prop({ required: true, type: Types.ObjectId })
  declare orderId: Types.ObjectId;

  @Prop({ required: true })
  declare originAddress: string;

  @Prop({ required: true })
  declare destinationAddress: string;

  @Prop({ required: true })
  declare shippingCost: number;

  @Prop({
    type: String,
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  declare status: DeliveryStatus;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
