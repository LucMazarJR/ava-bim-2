import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pedido' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos.' })
  async findAll() {
    return await this.orderService.findAll();
  }

  @Get('route')
  @ApiOperation({
    summary: 'Rota de entrega',
    description: 'Retorna pedidos pendentes/prontos ordenados por prioridade (especiais primeiro, depois por chegada) com coordenadas para cálculo de rota.',
  })
  @ApiResponse({ status: 200, description: 'Pedidos ordenados para rota.' })
  async getDeliveryRoute() {
    return await this.orderService.getDeliveryRoute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Pedido atualizado.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pedido' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pedido removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado.' })
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
