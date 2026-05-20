import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Silva',
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'E-mail do usuário (único)',
    example: 'maria@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
  })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    description: 'Idade do usuário',
    example: 25,
  })
  @IsNumber()
  age?: number;
}
