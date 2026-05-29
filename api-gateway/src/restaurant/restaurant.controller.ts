import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@ApiTags('Restaurant')
@ApiBearerAuth('JWT')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly httpService: HttpService) {}

  @Post()
  @ApiOperation({ summary: 'Criar restaurante', description: 'Cadastra um novo restaurante.' })
  @ApiBody({ type: CreateRestaurantDto })
  @ApiResponse({ status: 201, description: 'Restaurante criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() body: CreateRestaurantDto) {
    return this.httpService
      .post<unknown>(`${process.env.RESTAURANT_SERVICE_URL}/restaurant`, body)
      .pipe(map((r) => r.data));
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes', description: 'Retorna todos os restaurantes cadastrados.' })
  @ApiResponse({ status: 200, description: 'Lista de restaurantes.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.RESTAURANT_SERVICE_URL}/restaurant`)
      .pipe(map((r) => r.data));
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Listar restaurantes por dono' })
  @ApiParam({ name: 'ownerId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Restaurantes do dono.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.httpService
      .get<unknown>(`${process.env.RESTAURANT_SERVICE_URL}/restaurant/owner/${ownerId}`)
      .pipe(map((r) => r.data));
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Buscar restaurante por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.RESTAURANT_SERVICE_URL}/restaurant/id/${id}`)
      .pipe(map((r) => r.data));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar restaurante' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateRestaurantDto })
  @ApiResponse({ status: 200, description: 'Restaurante atualizado.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado.' })
  update(@Param('id') id: string, @Body() body: UpdateRestaurantDto) {
    return this.httpService
      .patch<unknown>(`${process.env.RESTAURANT_SERVICE_URL}/restaurant/${id}`, body)
      .pipe(map((r) => r.data));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover restaurante' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Restaurante removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Restaurante não encontrado.' })
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.RESTAURANT_SERVICE_URL}/restaurant/${id}`)
      .pipe(map((r) => r.data));
  }
}
