import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { MenuItem } from './schema/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

interface MongoError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

@Injectable()
export class MenuService {
  constructor(@InjectModel(MenuItem.name) private menuModel: Model<MenuItem>) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const created = new this.menuModel(dto);
    return await created.save();
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuModel.find();
  }

  async findByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return this.menuModel.find({ restaurantId });
  }

  async findById(id: string): Promise<MenuItem> {
    try {
      const item = await this.menuModel.findById(id);
      if (!item) throw new NotFoundException('Item não encontrado');
      return item;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    try {
      const updated = await this.menuModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (!updated) throw new NotFoundException('Item não encontrado');
      return updated;
    } catch (error) {
      const { code, keyValue } = error as MongoError;
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      if (code === 11000 && keyValue) {
        throw new BadRequestException('Dados duplicados');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<MenuItem> {
    try {
      const deleted = await this.menuModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Item não encontrado');
      return deleted;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }
}
