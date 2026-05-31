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
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Criar item do cardápio' })
  @ApiBody({ type: CreateMenuItemDto })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Campos obrigatórios faltando.' })
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens' })
  @ApiResponse({ status: 200, description: 'Lista de itens retornada.' })
  findAll() {
    return this.menuService.findAll();
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar itens por restaurante' })
  @ApiParam({ name: 'restaurantId', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Itens do restaurante retornados.' })
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item do cardápio' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiBody({ type: UpdateMenuItemDto })
  @ApiResponse({ status: 200, description: 'Item atualizado.' })
  @ApiResponse({
    status: 400,
    description: 'Nenhum campo para atualizar ou ID inválido.',
  })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar!');
    }
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover item do cardápio' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item removido.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
