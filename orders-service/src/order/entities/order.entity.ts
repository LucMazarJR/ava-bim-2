import { OrderStatus } from '../schema/order.schema';
import { Types } from 'mongoose';

export class Order {
  _id: Types.ObjectId;
  customerName: string;
  customerAddress: string;
  latitude: number;
  longitude: number;
  status: OrderStatus;
  isSpecial: boolean;
  specialDescription?: string;
  restaurantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
