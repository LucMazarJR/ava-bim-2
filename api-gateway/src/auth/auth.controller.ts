import { HttpService } from '@nestjs/axios';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map } from 'rxjs';
import { Public } from '../decorators/jwt_public.decorator';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login do usuário',
    description:
      'Autentica o usuário com e-mail e senha. Retorna um token JWT para ser usado nas demais requisições protegidas.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso. Retorna o token JWT.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciais inválidas',
      },
    },
  })
  login(@Body() body: LoginDto) {
    return this.httpService
      .post<unknown>(`${process.env.AUTH_SERVICE_URL}/auth/login`, body)
      .pipe(map((response) => response.data));
  }
}
