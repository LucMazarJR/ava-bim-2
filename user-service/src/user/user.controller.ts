import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário e persiste no banco de dados.',
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
        __v: 0,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Campos obrigatórios faltando.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  create(@Body() createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    if (!name || !email || !password) {
      throw new BadRequestException('Campos obrigatórios faltando!');
    }
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna todos os usuários cadastrados no banco de dados.',
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
          __v: 0,
        },
      ],
    },
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get('/email/:email')
  @ApiOperation({
    summary: 'Buscar usuário por e-mail',
    description: 'Retorna o usuário que possui o e-mail informado.',
  })
  @ApiParam({
    name: 'email',
    description: 'E-mail do usuário',
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
        __v: 0,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Get('/id/:id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna o usuário que possui o ID MongoDB informado.',
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
        __v: 0,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza parcialmente os dados do usuário com o ID informado.',
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
        __v: 0,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhum campo para atualizar ou ID inválido.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar!');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover usuário',
    description: 'Remove o usuário com o ID informado do banco de dados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID MongoDB do usuário a ser removido',
    example: '664f1b2e8f1a2b3c4d5e6f7a',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso.',
    schema: {
      example: {
        _id: '664f1b2e8f1a2b3c4d5e6f7a',
        name: 'Maria Silva',
        email: 'maria@email.com',
        age: 25,
        __v: 0,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
