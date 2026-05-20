import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { map } from 'rxjs';
import { Public } from '../decorators/jwt_public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@ApiBearerAuth('JWT')
@Controller('user')
export class UserController {
  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário no sistema. Endpoint público.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    schema: {
      example: {
        _id: '664f1b2e8f1a2b3c4d5e6f7a',
        name: 'Maria Silva',
        email: 'maria@email.com',
        age: 25,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() body: CreateUserDto) {
    return this.httpService
      .post<unknown>(`${process.env.USER_SERVICE_URL}/user`, body)
      .pipe(map((response) => response.data));
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Retorna a lista completa de usuários. Requer autenticação JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    schema: {
      example: [
        {
          _id: '664f1b2e8f1a2b3c4d5e6f7a',
          name: 'Maria Silva',
          email: 'maria@email.com',
          age: 25,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado. Token JWT inválido ou ausente.',
  })
  findAll() {
    return this.httpService
      .get<unknown>(`${process.env.USER_SERVICE_URL}/user`)
      .pipe(map((response) => response.data));
  }

  @Get('email/:email')
  @ApiOperation({
    summary: 'Buscar usuário por e-mail',
    description:
      'Retorna um único usuário pelo e-mail. Requer autenticação JWT.',
  })
  @ApiParam({
    name: 'email',
    description: 'E-mail do usuário a ser buscado',
    example: 'maria@email.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado.',
    schema: {
      example: {
        _id: '664f1b2e8f1a2b3c4d5e6f7a',
        name: 'Maria Silva',
        email: 'maria@email.com',
        age: 25,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findByEmail(@Param('email') email: string) {
    return this.httpService
      .get<unknown>(`${process.env.USER_SERVICE_URL}/user/email/${email}`)
      .pipe(map((response) => response.data));
  }

  @Get('id/:id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna um único usuário pelo ID. Requer autenticação JWT.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID MongoDB do usuário',
    example: '664f1b2e8f1a2b3c4d5e6f7a',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado.',
    schema: {
      example: {
        _id: '664f1b2e8f1a2b3c4d5e6f7a',
        name: 'Maria Silva',
        email: 'maria@email.com',
        age: 25,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findById(@Param('id') id: string) {
    return this.httpService
      .get<unknown>(`${process.env.USER_SERVICE_URL}/user/id/${id}`)
      .pipe(map((response) => response.data));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza parcialmente os dados de um usuário. Requer autenticação JWT.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID MongoDB do usuário a ser atualizado',
    example: '664f1b2e8f1a2b3c4d5e6f7a',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    schema: {
      example: {
        _id: '664f1b2e8f1a2b3c4d5e6f7a',
        name: 'Maria Silva Atualizada',
        email: 'maria.novo@email.com',
        age: 26,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.httpService
      .patch<unknown>(`${process.env.USER_SERVICE_URL}/user/${id}`, body)
      .pipe(map((response) => response.data));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover usuário',
    description:
      'Remove um usuário do sistema pelo ID. Requer autenticação JWT.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID MongoDB do usuário a ser removido',
    example: '664f1b2e8f1a2b3c4d5e6f7a',
  })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.httpService
      .delete<unknown>(`${process.env.USER_SERVICE_URL}/user/${id}`)
      .pipe(map((response) => response.data));
  }
}
