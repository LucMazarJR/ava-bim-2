import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryService } from './delivery.service';

@ApiTags('Delivery')
@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @ApiOperation({ summary: 'Criar entrega' })
  @ApiBody({ type: CreateDeliveryDto })
  @ApiResponse({ status: 201, description: 'Entrega criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return await this.deliveryService.create(createDeliveryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar entregas' })
  @ApiResponse({ status: 200, description: 'Lista de entregas.' })
  async findAll() {
    return await this.deliveryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar entrega por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Entrega encontrada.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  async findOne(@Param('id') id: string) {
    return await this.deliveryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar entrega' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateDeliveryDto })
  @ApiResponse({ status: 200, description: 'Entrega atualizada.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  async update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return await this.deliveryService.update(id, updateDeliveryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover entrega' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Entrega removida.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Entrega não encontrada.' })
  async remove(@Param('id') id: string) {
    return await this.deliveryService.remove(id);
  }
}
