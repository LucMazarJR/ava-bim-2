import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethod } from '../schema/payment.schema';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID do pedido', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @IsMongoId()
  declare orderId: string;

  @ApiProperty({ description: 'Valor total do pagamento em reais', example: 59.9 })
  @IsNumber()
  @IsPositive()
  declare amount: number;

  @ApiProperty({ description: 'Método de pagamento', enum: PaymentMethod, example: PaymentMethod.PIX })
  @IsEnum(PaymentMethod)
  declare method: PaymentMethod;

  @ApiPropertyOptional({ description: 'ID da transação no gateway externo', example: 'txn_abc123' })
  @IsString()
  @IsOptional()
  externalTransactionId?: string;
}
