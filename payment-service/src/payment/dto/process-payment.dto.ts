import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../schema/payment.schema';

const allowedStatuses = [PaymentStatus.CONFIRMED, PaymentStatus.FAILED, PaymentStatus.REFUNDED];

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Novo status do pagamento',
    enum: allowedStatuses,
    example: PaymentStatus.CONFIRMED,
  })
  @IsEnum(allowedStatuses)
  declare status: PaymentStatus.CONFIRMED | PaymentStatus.FAILED | PaymentStatus.REFUNDED;

  @ApiPropertyOptional({ description: 'ID da transação confirmada pelo gateway', example: 'txn_abc123' })
  @IsString()
  @IsOptional()
  externalTransactionId?: string;

  @ApiPropertyOptional({ description: 'Motivo da falha (quando status = FAILED)', example: 'Saldo insuficiente' })
  @IsString()
  @IsOptional()
  failureReason?: string;
}
