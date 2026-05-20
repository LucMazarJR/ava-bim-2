import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Silva',
  })
  name!: string;

  @ApiProperty({
    description: 'E-mail do usuário (único)',
    example: 'maria@email.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'Idade do usuário',
    example: 25,
  })
  age?: number;
}
