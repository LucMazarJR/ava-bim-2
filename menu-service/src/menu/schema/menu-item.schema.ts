import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema()
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

  @Prop({ default: true })
  available!: boolean;
}

export const MenuItemSchema: MongooseSchema = SchemaFactory.createForClass(MenuItem);
