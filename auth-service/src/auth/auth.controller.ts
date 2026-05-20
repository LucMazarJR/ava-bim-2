import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Valida as credenciais (e-mail e senha) e retorna um token JWT. ' +
      'Use o token retornado para acessar os endpoints protegidos.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Autenticação bem-sucedida. Retorna o token JWT.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Credenciais inválidas (e-mail não encontrado ou senha incorreta).',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos (e-mail em formato incorreto ou campos vazios).',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'email should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  validate(@Body() loginDto: LoginDto) {
    return this.authService.validate(loginDto);
  }
}
