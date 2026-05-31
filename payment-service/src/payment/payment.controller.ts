import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pagamento para um pedido' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou pagamento ativo já existente.' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos.' })
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Buscar pagamento por ID do pedido' })
  @ApiParam({ name: 'orderId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  async findByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrder(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id/process')
  @ApiOperation({
    summary: 'Processar pagamento (confirmar, falhar ou estornar)',
    description: 'Endpoint usado pelo gateway de pagamento para atualizar o status. Só aceita pagamentos com status PENDING.',
  })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: ProcessPaymentDto })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou pagamento não está pendente.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  async process(@Param('id') id: string, @Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentService.process(id, processPaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pagamento (apenas PENDING ou FAILED)' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Pagamento removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido ou pagamento confirmado não pode ser removido.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
