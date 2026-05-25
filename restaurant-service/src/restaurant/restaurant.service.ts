import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { Restaurant } from './schema/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

interface MongoError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    try {
      const created = new this.restaurantModel({
        ...createRestaurantDto,
        isOpen: createRestaurantDto.isOpen ?? false,
      });
      return await created.save();
    } catch (error) {
      const { code, keyValue } = error as MongoError;
      if (code === 11000 && keyValue) {
        throw new ConflictException('Restaurante já cadastrado');
      }
      throw error;
    }
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find();
  }

  async findById(id: string): Promise<Restaurant> {
    try {
      const restaurant = await this.restaurantModel.findById(id);
      if (!restaurant) throw new NotFoundException('Restaurante não encontrado');
      return restaurant;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }

  async findByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantModel.find({ ownerId });
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    try {
      const updated = await this.restaurantModel.findByIdAndUpdate(
        id,
        updateRestaurantDto,
        { new: true },
      );
      if (!updated) throw new NotFoundException('Restaurante não encontrado');
      return updated;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Restaurant> {
    try {
      const deleted = await this.restaurantModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Restaurante não encontrado');
      return deleted;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }
}
