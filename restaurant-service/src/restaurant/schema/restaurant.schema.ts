import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@Schema()
export class Address {
  @Prop({ required: true })
  street!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  state!: string;

  @Prop({ required: false })
  latitude?: number;

  @Prop({ required: false })
  longitude?: number;
}

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: Address })
  address!: Address;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true, default: false })
  isOpen!: boolean;

  @Prop({ required: true })
  ownerId!: string;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
