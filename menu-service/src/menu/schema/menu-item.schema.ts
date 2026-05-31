import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  restaurantId!: string;

  @Prop({ required: true, default: true })
  available!: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
