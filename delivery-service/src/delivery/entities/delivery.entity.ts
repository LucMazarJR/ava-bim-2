import { DeliveryStatus } from '../schema/delivery.schema';
import { Types } from 'mongoose';

export class Delivery {
  declare _id: Types.ObjectId;
  declare orderId: Types.ObjectId;
  declare originAddress: string;
  declare destinationAddress: string;
  declare shippingCost: number;
  declare status: DeliveryStatus;
  declare createdAt: Date;
  declare updatedAt: Date;
}
