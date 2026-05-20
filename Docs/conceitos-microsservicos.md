# Conceitos de Arquitetura de Microsserviços

> Material de apoio teórico | Trabalho de Faculdade — Web I  
> Stack: NestJS + MongoDB + Docker + JWT + Prometheus/Grafana

---

## 1. O problema que microsserviços resolvem

### O monolito

No início de qualquer projeto, o mais natural é construir tudo junto: um único processo Node.js com todas as rotas, toda a lógica de negócio, um único banco de dados. Isso se chama **monolito**.

O monolito funciona bem enquanto o projeto é pequeno. O problema aparece conforme ele cresce:

- Um bug em qualquer parte pode derrubar **toda** a aplicação
- Para suportar mais usuários, você precisa escalar a aplicação **inteira**, mesmo que só uma parte esteja sobrecarregada
- Times diferentes mexendo no mesmo código causam conflito constante
- Um deploy de uma feature pequena exige restartar **tudo**

### A proposta dos microsserviços

Microsserviços dividem a aplicação em **serviços menores e independentes**, onde cada um é responsável por **um domínio do negócio**.

| Característica | Monolito | Microsserviços |
|---|---|---|
| Processos | 1 processo, 1 servidor | N processos, N servidores |
| Banco de dados | 1 banco compartilhado | Banco isolado por serviço |
| Deploy | All-or-nothing | Independente por serviço |
| Escala | Tudo junto | Só o que precisa |
| Falha | Um bug pode derrubar tudo | Falha isolada por serviço |

---

## 2. Containers Docker — um por serviço

Cada microsserviço roda em seu próprio **container Docker**. Um container é como um "mini servidor" independente: tem seu próprio processo Node.js, sua própria porta, seu próprio sistema de arquivos isolado.

```
┌──────────────────────────────────────────────────────────────┐
│                       docker-compose                          │
│                                                              │
│  ┌────────────────┐    ┌────────────────┐                    │
│  │  gateway-app   │    │   auth-app     │                    │
│  │  porta: 3000   │    │   porta: 3002  │                    │
│  └────────────────┘    └────────────────┘                    │
│                                                              │
│  ┌────────────────┐    ┌────────────────┐                    │
│  │   users-app    │    │   menu-app     │                    │
│  │   porta: 3001  │    │   porta: 3003  │                    │
│  └────────────────┘    └────────────────┘                    │
│                                                              │
│  ┌────────────────┐    ┌──────────────────────┐              │
│  │   users-db     │    │  prometheus + grafana │              │
│  │  porta: 27017  │    │  portas: 9090 / 3030  │              │
│  └────────────────┘    └──────────────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

O **docker-compose** é o arquivo que orquestra todos esses containers: define a rede interna entre eles, as portas expostas e as variáveis de ambiente.

Dentro dessa rede, os containers se comunicam pelo **nome do serviço**. O gateway não chama `http://localhost:3001` — ele chama `http://users-app:3000`, porque `users-app` é o nome do container na rede interna Docker.

> **Atenção:** as portas externas (3001, 3002...) são para você acessar do host. Dentro da rede Docker, todos os serviços rodam na porta `3000` internamente. Por isso as URLs internas sempre terminam em `:3000`.

---

## 3. NestJS — a estrutura de cada serviço

Cada serviço é uma aplicação NestJS com três peças principais:

- **Module** — agrupa controllers, services e imports de um domínio
- **Controller** — recebe requisições HTTP, define rotas, delega ao service
- **Service** — contém a lógica de negócio e acesso ao banco

```typescript
// Exemplo real do projeto — user.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

O NestJS usa **injeção de dependência**: o service é passado automaticamente para o controller via constructor — você não instancia nada manualmente.

```typescript
// Controller só recebe a requisição e delega para o service
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);  // delega, não processa
  }
}
```

### DTOs e validação automática

**DTO** (Data Transfer Object) é uma classe que define o formato esperado dos dados de entrada. O `ValidationPipe` global valida automaticamente toda requisição antes de chegar ao controller:

```typescript
// create-user.dto.ts — padrão real do projeto
export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'Maria Silva' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'E-mail do usuário (único)', example: 'maria@email.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'senha123' })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: 'Idade do usuário', example: 25 })
  @IsNumber()
  age?: number;
}
```

Se o cliente enviar um campo obrigatório faltando ou um e-mail mal formatado, o NestJS retorna **400 Bad Request** automaticamente — sem precisar escrever nenhuma validação manual.

---

## 4. Componentes da arquitetura

### API Gateway

O Gateway é o **único ponto de entrada** da aplicação. O mundo externo (Postman, frontend) só conhece o Gateway — nunca acessa os serviços diretamente.

**Responsabilidades:**
1. **Validar o JWT** via Guard global — token inválido é rejeitado aqui
2. **Rotear** para o serviço correto via `HttpService` (`@nestjs/axios`)
3. **Expor o Swagger** centralizado em `/api`
4. **Repassar headers internos** (`x-user-id`, `x-user-role`) para os serviços

```
POST /auth/login    → http://auth-app:3000/auth/login
GET  /user          → http://users-app:3000/user
POST /menu          → http://menu-app:3000/menu
```

O cliente nunca sabe que existem múltiplos serviços. Para ele, tudo vem de `localhost:3000`.

### Auth Service

Responsável por identidade:
- Recebe e-mail e senha (`POST /auth/login`)
- Busca o usuário no user-service via HTTP interno
- Valida a senha com bcrypt
- Devolve um JWT assinado

É o **único** serviço que conhece o `JWT_SECRET`.

### User Service

Responsável por dados de usuários:
- CRUD completo (criar, listar, buscar por e-mail, buscar por ID, atualizar, remover)
- Senhas armazenadas com bcrypt (nunca em texto plano)
- Expõe `GET /user/email/:email` para uso interno do auth-service

### Serviços de negócio (ex: Menu Service)

Implementam a lógica da aplicação. **Não validam JWT** — confiam que, se a requisição chegou pelo Gateway, o usuário já foi autenticado. Usam os headers `x-user-id` e `x-user-role` para saber quem está fazendo a requisição e controlar permissões.

---

## 5. JWT — como o token funciona

O JWT (JSON Web Token) tem 3 partes separadas por `.`:

```
eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOiIxMjMifQ . assinatura
       HEADER                   PAYLOAD              SIGNATURE
```

- **Header** — algoritmo de assinatura (HS256)
- **Payload** — dados do usuário. É decodificável por qualquer um, **não coloque senha aqui**
- **Signature** — garante que o token não foi adulterado. Só quem tem o `JWT_SECRET` consegue criar uma assinatura válida

No projeto, o payload gerado pelo auth-service contém:

```typescript
const payload = { sub: user.email, username: user.name };
```

> **Próximo passo:** adicionar `role` ao payload para que o Gateway possa repassar a permissão nos headers internos: `{ sub: user.email, username: user.name, role: user.role }`.

---

## 6. Guard JWT e o decorator @Public()

No API Gateway, o Guard é registrado **globalmente** — todas as rotas são protegidas por padrão. Para abrir uma rota específica (como login), usa-se o decorator `@Public()`.

```typescript
// app.module.ts do gateway — Guard global
@Module({
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard }, // aplicado em todas as rotas
  ],
})
export class AppModule {}
```

```typescript
// guards/src.guard.ts — implementação real do projeto
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifica se a rota tem o decorator @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;  // rota aberta, passa direto

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;  // dados do usuário ficam disponíveis nos controllers
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

```typescript
// decorators/jwt_public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Uso nos controllers do Gateway:

```typescript
@Public()       // ← login é público, não precisa de token
@Post('login')
login(@Body() body: LoginDto) { ... }

@Get()          // ← sem @Public(), o Guard exige token
findAll() { ... }
```

---

## 7. Fluxo completo de uma requisição

### Login (rota pública)

```
1. Cliente → POST localhost:3000/auth/login { email, password }
2. Guard vê @Public() → deixa passar
3. Gateway repassa → http://auth-app:3000/auth/login
4. auth-service chama → http://users-app:3000/user/email/{email}
5. user-service retorna o usuário com a senha hasheada
6. auth-service compara com bcrypt
7. auth-service gera JWT { sub: email, username: name }
8. Gateway devolve { access_token: "eyJ..." } para o cliente
```

### Requisição autenticada

```
1. Cliente → GET localhost:3000/user
   Header: Authorization: Bearer eyJ...

2. Guard intercepta → token não é @Public()
3. Guard extrai o Bearer token
4. Guard verifica com jwtService.verifyAsync()
   → Token inválido: lança UnauthorizedException (401), para aqui
   → Token válido: decodifica { sub: email, username: name }
5. Guard salva o payload em request['user']

6. Gateway repassa → http://users-app:3000/user
   (em breve: com headers x-user-id e x-user-role)

7. user-service consulta MongoDB, retorna os dados
8. Gateway devolve a resposta para o cliente
```

---

## 8. Autorização — controlando o que cada usuário pode fazer

Autenticação responde *"quem é você?"*. Autorização responde *"o que você pode fazer?"*.

A diferença entre os status:
- **401 Unauthorized** — token ausente ou inválido (não autenticado) — rejeitado no **Gateway**
- **403 Forbidden** — token válido, mas sem permissão para aquela ação — rejeitado no **serviço de negócio**

O JWT carregará um campo `role` no payload (ex: `"owner"` ou `"customer"`). O Gateway repassa esse valor no header `x-user-role`. Os serviços de negócio usam um **RolesGuard**:

```typescript
// No controller do menu-service
@Delete(':id')
@Roles('owner')       // só donos podem deletar itens
@UseGuards(RolesGuard)
remove(@Param('id') id: string) {
  return this.menuService.remove(id);
}
```

O RolesGuard lê o header `x-user-role` e verifica se a role do usuário está na lista de roles permitidas. Se não estiver, lança **ForbiddenException** (403).

---

## 9. Comunicação HTTP entre serviços

Quando um serviço precisa chamar outro internamente, usa o `HttpModule` do NestJS (`@nestjs/axios`). Esse é o padrão real do projeto:

```typescript
// auth.service.ts — auth-service chamando user-service
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  async validate(loginDto: LoginDto) {
    const response = await firstValueFrom(
      this.httpService.get<UserDto>(
        `${process.env.USER_SERVICE_URL}/user/email/${loginDto.email}`,
      ),
    );
    const user = response.data;
    // ... valida senha e gera token
  }
}
```

```typescript
// user.controller.ts do Gateway — proxy com RxJS map
@Get()
findAll() {
  return this.httpService
    .get<unknown>(`${process.env.USER_SERVICE_URL}/user`)
    .pipe(map((response) => response.data));  // extrai só o .data da resposta Axios
}
```

> **`firstValueFrom` vs `.pipe(map(...))`**  
> - `firstValueFrom` — converte Observable em Promise. Usado nos **services** onde você precisa do resultado para continuar a lógica  
> - `.pipe(map(...))` — retorna o Observable diretamente. Usado nos **controllers do Gateway** que apenas repassam a resposta — o NestJS resolve o Observable automaticamente

A variável de ambiente `USER_SERVICE_URL` vale `http://users-app:3000` dentro do Docker e `http://localhost:3001` no desenvolvimento local.

---

## 10. Documentação com Swagger

O `@nestjs/swagger` gera uma página interativa automaticamente a partir dos decorators do código.

**No `main.ts`** — configuração (padrão real do Gateway):

```typescript
const config = new DocumentBuilder()
  .setTitle('API Gateway')
  .setDescription('Porta de entrada da aplicação.')
  .setVersion('1.0')
  .addBearerAuth(          // habilita o campo de token na UI
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'JWT',
  )
  .addTag('Auth', 'Autenticação de usuários')
  .addTag('User', 'Gerenciamento de usuários')
  .build();

SwaggerModule.setup('api', app, documentFactory, {
  swaggerOptions: { persistAuthorization: true },  // mantém o token entre reloads
});
```

**Nos controllers** — decorators descrevem cada endpoint:

```typescript
@ApiTags('User')           // agrupa no Swagger
@ApiBearerAuth('JWT')      // mostra o cadeado (rota protegida)
@Controller('user')
export class UserController {

  @Post()
  @ApiOperation({ summary: 'Criar usuário', description: 'Cria e persiste um novo usuário.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  create(@Body() dto: CreateUserDto) { ... }
}
```

**Nos DTOs** — campos documentados com `@ApiProperty`:

```typescript
export class CreateUserDto {
  @ApiProperty({ description: 'Nome completo', example: 'Maria Silva' })
  @IsNotEmpty()
  name!: string;
}
```

**Resultado:** `localhost:3000/api` exibe a documentação interativa completa com campo para inserir o Bearer token.

---

## 11. Observabilidade — Prometheus e Grafana

### O que é observabilidade?

É a capacidade de entender o que está acontecendo dentro da aplicação em tempo real. Para este projeto, o foco é **métricas**:

- Número de requisições por segundo
- Latência média das respostas
- Taxa de erros por serviço

### Como Prometheus coleta métricas

Prometheus funciona no modelo **pull**: periodicamente vai nos serviços buscar métricas no endpoint `/metrics`.

```
Serviço NestJS        Prometheus            Grafana
  GET /metrics  ◄──── coleta a cada 15s ◄── consulta e exibe
```

Em cada serviço NestJS, a lib `prom-client` expõe esse endpoint no `main.ts`:

```typescript
import { collectDefaultMetrics, Registry } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });

app.getHttpAdapter().get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

O `prometheus.yml` diz quais serviços monitorar (use os nomes do docker-compose):

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
```

O Grafana lê do Prometheus e exibe dashboards com gráficos em tempo real.

---

## 12. Testes de carga com k6

O k6 simula múltiplos usuários fazendo requisições simultâneas. O script define quantos usuários virtuais, por quanto tempo, e o que cada um faz.

**Exemplo de script para o projeto:**

```javascript
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,         // 50 usuários simultâneos
  duration: '30s', // por 30 segundos
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições abaixo de 500ms
  },
};

export default function () {
  // 1. Login
  const loginRes = http.post('http://localhost:3000/auth/login', JSON.stringify({
    email: 'maria@email.com',
    password: 'senha123',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login OK': (r) => r.status === 200 });
  const token = loginRes.json('access_token');

  // 2. Requisição autenticada
  const usersRes = http.get('http://localhost:3000/user', {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(usersRes, { 'users OK': (r) => r.status === 200 });
  sleep(1);
}
```

O objetivo na apresentação: rodar o k6 enquanto o Grafana exibe os gráficos de métricas subindo em tempo real — demonstra que autenticação, serviços e observabilidade funcionam de ponta a ponta.

---

## 13. Por que separar domínios?

Para justificar o uso de microsserviços, os domínios precisam ser **naturalmente independentes**:

| Serviço | Domínio | Responsabilidade |
|---------|---------|-----------------|
| api-gateway | Entrada | Como o mundo acessa tudo |
| auth-service | Identidade | Quem é o usuário |
| user-service | Usuários | Dados e CRUD de usuários |
| menu-service | Cardápio | Restaurantes e itens do menu |

Cada um pode evoluir, ser deployado e escalar independentemente. Se o menu-service cair, o login ainda funciona. Se um serviço específico precisar de mais recursos, só ele é escalado.

---

## 14. Deploy

### Deploy local

É o mais simples e suficiente para a apresentação. Qualquer pessoa que clonar o repositório consegue subir tudo com:

```bash
git clone https://github.com/LucMazarJR/ava-bim-2.git
cd ava-bim-2

cp api-gateway/.env.example  api-gateway/.env
cp user-service/.env.example user-service/.env
cp auth-service/.env.example auth-service/.env
# preencher as variáveis

docker-compose up -d
```

### Deploy em nuvem (opcional)

Para expor a aplicação na internet:

| Plataforma | O que oferece | Observação |
|---|---|---|
| **Render** | deploy de containers Docker, plano gratuito | boa opção para o projeto |
| **Railway** | deploy via GitHub, suporte a MongoDB | simples de configurar |
| **Fly.io** | containers Docker, boa performance | requer cartão de crédito |

O fluxo geral:
1. Push do código para o GitHub
2. Conectar o repositório na plataforma
3. Configurar as variáveis de ambiente no painel (equivalente ao `.env`)
4. A plataforma lê o `Dockerfile` e faz o build automaticamente

Para o trabalho, deploy local já é suficiente.
