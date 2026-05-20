# Guia de Desenvolvimento

> Como o time vai trabalhar junto | Git + NestJS + Docker + Organização

---

## Estrutura do projeto

Cada serviço é uma **aplicação NestJS completamente independente**: tem seu próprio `package.json`, `node_modules`, `tsconfig.json` e `.env`. Vivem em pastas separadas dentro do mesmo repositório.

```
ava-bim-2/
│
├── .gitignore
├── .env.example
├── docker-compose.yml      ← orquestra todos os containers
├── readme.md
│
├── api-gateway/            ← NestJS — porta de entrada, JWT Guard, roteamento
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/           ← proxy para auth-service
│   │   ├── user/           ← proxy para user-service
│   │   ├── guards/         ← AuthGuard (JWT global)
│   │   └── decorators/     ← @Public() para rotas abertas
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── Dockerfile
│
├── auth-service/           ← NestJS — login e emissão de JWT
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── auth/
│   │       ├── dto/        ← LoginDto, UserDto
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── auth.module.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── Dockerfile
│
├── user-service/           ← NestJS — CRUD de usuários
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── user/
│   │       ├── dto/        ← CreateUserDto, UpdateUserDto
│   │       ├── schema/     ← UserSchema (Mongoose)
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       └── user.module.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── Dockerfile
│
├── menu-service/           ← próximo serviço a ser criado
│
├── monitoring/
│   └── prometheus.yml
│
└── Docs/
```

---

## Checklist geral do projeto

### ✅ Concluído

- [x] Repositório no GitHub com colaboradores
- [x] Estrutura de pastas e branches por serviço
- [x] `docker-compose.yml` com todos os serviços e bancos
- [x] `Dockerfile` funcionando (modo development com hot reload)
- [x] `docker-compose up` sobe tudo sem erro
- [x] User Service — CRUD completo com MongoDB e bcrypt
- [x] Auth Service — Login com JWT, comunicação HTTP com user-service
- [x] API Gateway — Guard JWT global, `@Public()`, roteamento via HttpService
- [x] Swagger em todos os serviços (`/api`)
- [x] DTOs com validação via `class-validator`
- [x] Conventional commits com escopos

### 🔲 Próximos passos

- [ ] Menu Service — CRUD de cardápios/restaurantes seguindo os padrões estabelecidos
- [ ] `RolesGuard` no menu-service (dono vs cliente)
- [ ] Propagação de `x-user-id` e `x-user-role` no Gateway → serviços internos
- [ ] Endpoint `/metrics` (prom-client) em cada serviço
- [ ] `prometheus.yml` com todos os targets
- [ ] Dashboard no Grafana
- [ ] Script de teste de carga com k6
- [ ] Atualizar `docker-compose.yml` com menu-service e monitoring

---

## Organização do Git

### Branches e serviços

| Serviço | Pasta | Branch | Porta externa |
|---|---|---|---|
| API Gateway | `api-gateway/` | `gateway` → `develop` | 3000 |
| Auth Service | `auth-service/` | `auth` → `develop` | 3002 |
| User Service | `user-service/` | `user` → `develop` | 3001 |
| Menu Service | `menu-service/` | `menu` → `develop` | 3003 |

```
main
└── develop
    ├── gateway
    ├── auth
    ├── user
    └── menu
```

Regra simples: **cada pessoa trabalha na sua branch e abre PR para `develop`**. O merge na `main` é feito quando tudo estiver integrado e funcionando.

### Convenção de commits

```
tipo(escopo): descrição curta
```

| Prefixo | Quando usar |
|---------|-------------|
| `feat(menu):` | nova funcionalidade no menu-service |
| `fix(gateway):` | correção de bug no api-gateway |
| `chore(menu):` | configuração, dependências |
| `docs:` | atualização de documentação |
| `refactor(auth):` | refatoração sem mudar comportamento |

Exemplos do projeto:

```bash
git commit -m "chore(gateway): add swagger documentation"
git commit -m "feat(user): add findByEmail endpoint"
git commit -m "docs: update development guide"
```

### Fluxo de trabalho diário

```bash
# Sincronizar antes de começar
git checkout develop
git pull origin develop

git checkout menu   # sua branch
git merge develop

# Commitar com frequência
git add menu-service/src/menu/menu.service.ts
git commit -m "feat(menu): add create menu item endpoint"
git push origin menu

# Quando o serviço estiver pronto → PR para develop
```

---

## Como rodar o projeto

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Node.js 22+ (para desenvolvimento local fora do Docker)

### Do zero

```bash
git clone https://github.com/LucMazarJR/ava-bim-2.git
cd ava-bim-2

# Copiar e preencher o .env de cada serviço
cp api-gateway/.env.example  api-gateway/.env
cp user-service/.env.example user-service/.env
cp auth-service/.env.example auth-service/.env

# Subir tudo
docker-compose up -d

# Verificar se subiu
docker-compose ps
```

### Serviços disponíveis

```
http://localhost:3000      → api-gateway
http://localhost:3000/api  → Swagger do Gateway (centralizado)
http://localhost:3001/api  → Swagger do user-service
http://localhost:3002/api  → Swagger do auth-service
```

---

## Padrões estabelecidos no projeto

Estes são os padrões que os três serviços já seguem. Ao criar o menu-service, siga os mesmos.

### 1. Estrutura de módulo

```
menu-service/src/menu/
├── dto/
│   ├── create-menu-item.dto.ts
│   └── update-menu-item.dto.ts
├── schema/
│   └── menu-item.schema.ts
├── menu.controller.ts
├── menu.service.ts
└── menu.module.ts
```

### 2. Schema Mongoose

```typescript
// schema/menu-item.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema()
export class MenuItem {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  restaurantId!: string;  // ID do dono/restaurante
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
```

### 3. DTOs com validação e Swagger

```typescript
// dto/create-menu-item.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ description: 'Nome do item', example: 'X-Burguer' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Preço em reais', example: 25.90 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({ description: 'Descrição do item', example: 'Hambúrguer artesanal com queijo' })
  @IsString()
  description?: string;
}
```

> **Padrão:** use `@ApiProperty` + `@IsNotEmpty()` para campos obrigatórios e `@ApiPropertyOptional` + sem `@IsNotEmpty()` para opcionais.

### 4. Service com tratamento de erros

```typescript
// menu.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error, Model } from 'mongoose';
import { MenuItem } from './schema/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(MenuItem.name) private menuModel: Model<MenuItem>,
  ) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = new this.menuModel(dto);
    return await item.save();
  }

  async findAll() {
    return await this.menuModel.find();
  }

  async findById(id: string) {
    try {
      const item = await this.menuModel.findById(id);
      if (!item) throw new NotFoundException('Item não encontrado');
      return item;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('ID inválido');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    try {
      const updated = await this.menuModel.findByIdAndUpdate(id, dto, { new: true });
      if (!updated) throw new NotFoundException('Item não encontrado');
      return updated;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('ID inválido');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deleted = await this.menuModel.findByIdAndDelete(id);
      if (!deleted) throw new NotFoundException('Item não encontrado');
      return deleted;
    } catch (error) {
      if (error instanceof Error.CastError) {
        throw new BadRequestException('ID inválido');
      }
      throw error;
    }
  }
}
```

> **Padrão:** o service trata os erros. O controller apenas delega. Use `Error.CastError` para IDs MongoDB inválidos, `NotFoundException` para não encontrado.

### 5. Controller com Swagger

```typescript
// menu.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: 'Criar item', description: 'Cria um novo item no cardápio.' })
  @ApiBody({ type: CreateMenuItemDto })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar itens', description: 'Retorna todos os itens do cardápio.' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item encontrado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar item' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item atualizado.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover item' })
  @ApiParam({ name: 'id', example: '664f1b2e8f1a2b3c4d5e6f7a' })
  @ApiResponse({ status: 200, description: 'Item removido.' })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
```

### 6. Module

```typescript
// menu.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuItem, MenuItemSchema } from './schema/menu-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MenuItem.name, schema: MenuItemSchema }]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
```

### 7. main.ts — padrão dos serviços de negócio

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Menu Service')
    .setDescription('Serviço interno de gerenciamento de cardápios.')
    .setVersion('1.0')
    .addTag('Menu', 'Gerenciamento de itens do cardápio')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

---

## Controle de permissões com RolesGuard

O Gateway já repassa o payload JWT no objeto `request['user']` após validação. O próximo passo é repassar essas informações nos **headers internos** para os serviços de negócio saberem quem está fazendo a requisição.

### Passo 1 — Repassar headers no Gateway

No Gateway, após o Guard validar o token, o controller que faz proxy deve incluir os headers internos:

```typescript
// No controller do Gateway (ex: menu.controller.ts no api-gateway)
import { Headers, Req } from '@nestjs/common';
import { Request } from 'express';

@Get()
findAll(@Req() req: Request) {
  const userId = req['user']?.sub;
  const userRole = req['user']?.role;

  return this.httpService
    .get<unknown>(`${process.env.MENU_SERVICE_URL}/menu`, {
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
    })
    .pipe(map((response) => response.data));
}
```

> Para isso funcionar, o JWT precisa carregar `role` no payload. No auth-service, atualize o payload gerado:
> ```typescript
> const payload = { sub: user._id, username: user.name, role: user.role };
> ```
> E adicione `role` no schema do user-service.

### Passo 2 — RolesGuard no serviço de negócio

```typescript
// menu-service/src/guards/roles.guard.ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true; // rota sem @Roles() é livre

    const request = context.switchToHttp().getRequest();
    const userRole = request.headers['x-user-role'];

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Permissão insuficiente');
    }
    return true;
  }
}
```

Uso no controller do menu-service:

```typescript
@Delete(':id')
@Roles('owner')          // só dono pode deletar
@UseGuards(RolesGuard)
@ApiOperation({ summary: 'Remover item (apenas dono)' })
remove(@Param('id') id: string) {
  return this.menuService.remove(id);
}
```

> **Lógica dos status:**
> - **401 Unauthorized** → token ausente ou inválido (Gateway rejeita)
> - **403 Forbidden** → token válido, mas role errada (RolesGuard rejeita)

---

## Endpoint `/metrics` para Prometheus

Cada serviço precisa expor métricas para o Prometheus coletar. Instale o `prom-client`:

```bash
cd nome-do-servico
npm install prom-client
```

Adicione no `main.ts` de cada serviço:

```typescript
import { collectDefaultMetrics, Registry } from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ... configuração Swagger e ValidationPipe ...

  // Métricas para o Prometheus
  const register = new Registry();
  collectDefaultMetrics({ register });

  app.getHttpAdapter().get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  await app.listen(process.env.PORT ?? 3000);
}
```

Depois de adicionar em todos os serviços, atualize o `monitoring/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['gateway-app:3000']

  - job_name: 'user-service'
    static_configs:
      - targets: ['users-app:3000']

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-app:3000']

  - job_name: 'menu-service'
    static_configs:
      - targets: ['menu-app:3000']
```

---

## Criando o Menu Service do zero

### 1. Inicializar o projeto NestJS

```bash
# Na raiz do repositório, na branch menu
npm install -g @nestjs/cli
nest new menu-service --skip-git
```

### 2. Instalar dependências

```bash
cd menu-service
npm install @nestjs/mongoose mongoose
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install prom-client
```

### 3. Adicionar ao docker-compose.yml

```yaml
  # Menu Service (3)
  menu-app:
    build:
      context: ./menu-service
      target: development
    env_file:
      - ./menu-service/.env
    environment:
      - CHOKIDAR_USEPOLLING=true
    ports:
      - "3003:3000"
    volumes:
      - ./menu-service:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - menu-db

  menu-db:
    image: mongo
    env_file:
      - ./menu-service/.env
    volumes:
      - menu-data:/data/db

volumes:
  users-data:
  menu-data:  # ← adicionar aqui também
```

### 4. Adicionar ao API Gateway

Crie `api-gateway/src/menu/menu.module.ts` e `menu.controller.ts` seguindo o mesmo padrão do `user.module.ts` e `user.controller.ts`. Configure a variável `MENU_SERVICE_URL` no `.env` do gateway.

### 5. Estrutura de arquivos a criar

```
menu-service/src/
├── main.ts                         ← copiar padrão do user-service, trocar título
├── app.module.ts                   ← importar MenuModule + MongooseModule.forRoot
└── menu/
    ├── dto/
    │   ├── create-menu-item.dto.ts ← campos: name, price, description
    │   └── update-menu-item.dto.ts ← PartialType(CreateMenuItemDto)
    ├── schema/
    │   └── menu-item.schema.ts     ← campos: name, price, description, restaurantId
    ├── menu.controller.ts          ← CRUD completo com Swagger
    ├── menu.service.ts             ← lógica + tratamento de erros
    └── menu.module.ts              ← registrar schema e módulo
```

---

## Docker

### Dockerfile (padrão de todos os serviços)

```dockerfile
FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

CMD ["sh", "-c", "npm install && npm run start:dev"]
```

### Comandos essenciais

```bash
# Subir tudo
docker-compose up -d

# Ver logs de um serviço
docker-compose logs -f menu-app

# Rebuildar após mudar Dockerfile
docker-compose up -d --build menu-app

# Reiniciar após instalar pacote (sem rebuild)
docker-compose restart menu-app

# Derrubar tudo
docker-compose down

# Derrubar e resetar bancos
docker-compose down -v

# Ver status
docker-compose ps
```

> **Quando usar `--build`?**  
> Só ao mudar o `Dockerfile`. Mudança de código → hot reload automático. Nova dependência (`npm install pacote`) → `docker-compose restart nome-do-servico`.

### Hot reload no Windows

Adicione no `tsconfig.json` de cada serviço para o watch funcionar dentro do Docker:

```json
{
  "compilerOptions": { ... },
  "watchOptions": {
    "watchFile": "fixedPollingInterval",
    "watchDirectory": "fixedPollingInterval",
    "fallbackPolling": "fixedinterval"
  }
}
```

---

## Testando isolado

Durante o desenvolvimento, suba só o banco e o seu serviço:

```bash
# Só o banco e o serviço em desenvolvimento
docker-compose up -d menu-db menu-app

# Ou rode local (mais rápido):
cd menu-service
npm run start:dev
```

Teste no Swagger do serviço (`localhost:3003/api`) ou via Postman diretamente na porta do serviço. Quando funcionar isolado, avise o time para integrar no compose completo e no Gateway.

---

## Dicas para evitar conflitos

- **Não mexa em arquivos de outros serviços.** Converse antes se precisar
- **O `docker-compose.yml` é compartilhado** — alinhem antes de fazer merge de mudanças nele
- **Antes de abrir PR**, rode `docker-compose up --build` localmente e confirme que tudo sobe
- **Variável de ambiente nova**: adicione ao `.env.example` antes de fazer merge
- **Nunca commite `node_modules/`** — o `.gitignore` já cobre
- **Nunca commite `.env`** — use `.env.example` como referência
