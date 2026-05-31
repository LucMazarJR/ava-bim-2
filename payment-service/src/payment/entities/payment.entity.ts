import { PaymentMethod, PaymentStatus } from '../schema/payment.schema';
import { Types } from 'mongoose';

export class Payment {
  declare _id: Types.ObjectId;
  declare orderId: Types.ObjectId;
  declare amount: number;
  declare method: PaymentMethod;
  declare status: PaymentStatus;
  externalTransactionId?: string;
  failureReason?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}
