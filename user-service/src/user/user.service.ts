import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { Error, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

interface MongoError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const bcryptedPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = bcryptedPassword;
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      const { code, keyValue } = error as MongoError;
      if (code === 11000 && keyValue) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findById(id: string) {
    try {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      return user;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id invalido');
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      );
      if (!updatedUser) {
        throw new NotFoundException('Usuário nao encontrado');
      }
      return updatedUser;
    } catch (error) {
      const { code, keyValue } = error as MongoError;
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id invalido');
      }
      if (code === 11000 && keyValue) {
        throw new ConflictException('Email já cadastrado');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new NotFoundException('Usuário não encontrado');
      }
      return deletedUser;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('Id inválido');
      }
      throw error;
    }
  }
}
