import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller('orders')
export class OrdersController {
  constructor(private readonly httpService: HttpService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pedido', description: 'Cria um novo pedido vinculado a um restaurante.' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() body: CreateOrderDto) {
    return this.httpService
      .post<unknown>(`${process.env.ORDERS_SERVICE_URL}/orders`, body)
      .pipe(map((r) => r.data));
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos', description: 'Retorna todos os pedidos ordenados por data de criação.' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.ORDERS_SERVICE_URL}/orders`)
      .pipe(map((r) => r.data));
  }

  @Get('route')
  @ApiOperation({
    summary: 'Rota de entrega',
    description: 'Retorna pedidos pendentes/prontos ordenados por prioridade (especiais primeiro, depois por chegada) com coordenadas para cálculo de rota.',
  })
  @ApiResponse({ status: 200, description: 'Pedidos ordenados para rota.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  getDeliveryRoute() {
    return this.httpService
      .get<unknown>(`${process.env.ORDERS_SERVICE_URL}/orders/route`)
      .pipe(map((r) => r.data));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.ORDERS_SERVICE_URL}/orders/${id}`)
      .pipe(map((r) => r.data));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Pedido atualizado.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  update(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    return this.httpService
      .patch<unknown>(`${process.env.ORDERS_SERVICE_URL}/orders/${id}`, body)
      .pipe(map((r) => r.data));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pedido' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pedido removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.ORDERS_SERVICE_URL}/orders/${id}`)
      .pipe(map((r) => r.data));
  }
}
