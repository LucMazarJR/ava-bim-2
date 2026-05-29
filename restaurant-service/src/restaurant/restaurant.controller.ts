import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@ApiTags('Restaurant')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @ApiOperation({ summary: 'Criar restaurante' })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({ status: 201, description: 'Restaurante criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Campos obrigatórios faltando.' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os restaurantes' })
  @ApiResponse({ status: 200, description: 'Lista de restaurantes.' })
  findAll() {
    return this.restaurantService.findAll();
  }

  @Get('/id/:id')
  @ApiOperation({ summary: 'Buscar restaurante por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.restaurantService.findById(id);
  }

  @Get('/owner/:ownerId')
  @ApiOperation({ summary: 'Listar restaurantes por dono' })
  @ApiParam({ name: 'ownerId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Restaurantes do dono.' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.restaurantService.findByOwner(ownerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar restaurante' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({ status: 200, description: 'Restaurante atualizado.' })
  @ApiResponse({ status: 400, description: 'Nenhum campo para atualizar ou ID inválido.' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    if (!updateRestaurantDto || Object.keys(updateRestaurantDto).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar!');
    }
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover restaurante' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Restaurante removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado.' })
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}
