import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@ApiTags('Delivery')
@ApiBearerAuth('JWT')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly httpService: HttpService) {}

  @Post()
  @ApiOperation({ summary: 'Criar entrega', description: 'Cria uma nova entrega vinculada a um pedido.' })
  @ApiBody({ type: CreateDeliveryDto })
  @ApiResponse({ status: 201, description: 'Entrega criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() body: CreateDeliveryDto) {
    return this.httpService
      .post<unknown>(`${process.env.DELIVERY_SERVICE_URL}/deliveries`, body)
      .pipe(map((r) => r.data));
  }

  @Get()
  @ApiOperation({ summary: 'Listar entregas', description: 'Retorna todas as entregas ordenadas por data de criação.' })
  @ApiResponse({ status: 200, description: 'Lista de entregas.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.DELIVERY_SERVICE_URL}/deliveries`)
      .pipe(map((r) => r.data));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar entrega por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Entrega encontrada.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.DELIVERY_SERVICE_URL}/deliveries/${id}`)
      .pipe(map((r) => r.data));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar entrega' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateDeliveryDto })
  @ApiResponse({ status: 200, description: 'Entrega atualizada.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  update(@Param('id') id: string, @Body() body: UpdateDeliveryDto) {
    return this.httpService
      .patch<unknown>(`${process.env.DELIVERY_SERVICE_URL}/deliveries/${id}`, body)
      .pipe(map((r) => r.data));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover entrega' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Entrega removida.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.DELIVERY_SERVICE_URL}/deliveries/${id}`)
      .pipe(map((r) => r.data));
  }
}
