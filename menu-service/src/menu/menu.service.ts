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

@Injectable()
export class MenuService {
  constructor(@InjectModel(MenuItem.name) private menuModel: Model<MenuItem>) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    return await new this.menuModel(dto).save();
  }

  async findAll(): Promise<MenuItem[]> {
    return await this.menuModel.find();
  }

  async findByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return await this.menuModel.find({ restaurantId });
  }

  async findById(id: string): Promise<MenuItem> {
    try {
      const item = await this.menuModel.findById(id);
      if (!item) throw new NotFoundException('Item não encontrado');
      return item;
    } catch (error: unknown) {
      if (error instanceof Error.CastError) throw new BadRequestException('ID inválido');
      if (error instanceof Error) throw error;
      throw new BadRequestException('Erro inesperado');
    }
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    try {
      const updated = await this.menuModel.findByIdAndUpdate(id, dto, { new: true });
      if (!updated) throw new NotFoundException('Item não encontrado');
      return updated;
    } catch (error: unknown) {
      if (error instanceof Error.CastError) throw new BadRequestException('ID inválido');
      if (error instanceof Error) throw error;
      throw new BadRequestException('Erro inesperado');
    }
  }

  async remove(id: string): Promise<MenuItem> {
    try {
      const deleted = await this.menuModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Item não encontrado');
      return deleted;
    } catch (error: unknown) {
      if (error instanceof Error.CastError) throw new BadRequestException('ID inválido');
      if (error instanceof Error) throw error;
      throw new BadRequestException('Erro inesperado');
    }
  }
}
