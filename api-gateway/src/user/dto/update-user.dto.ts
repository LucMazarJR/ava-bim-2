import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'Maria Silva Atualizada',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'E-mail do usuário',
    example: 'maria.novo@email.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Senha do usuário',
    example: 'novaSenha456',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Idade do usuário',
    example: 26,
  })
  age?: number;
}
