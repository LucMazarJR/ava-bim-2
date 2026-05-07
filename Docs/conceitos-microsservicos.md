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
┌─────────────────────────────────────────────────────────┐
│                    docker-compose                        │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  api-gateway    │    │  auth-service   │             │
│  │  porta: 3000    │    │  porta: 3001    │             │
│  └─────────────────┘    └─────────────────┘             │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  servico-a      │    │  servico-b      │             │
│  │  porta: 3002    │    │  porta: 3003    │             │
│  └─────────────────┘    └─────────────────┘             │
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────┐        │
│  │    mongodb      │    │  prometheus + grafana │        │
│  │  porta: 27017   │    │  portas: 9090 / 3030  │        │
│  └─────────────────┘    └──────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

O **docker-compose** é o arquivo que orquestra todos esses containers: define a rede interna entre eles, as portas expostas e as variáveis de ambiente.

Dentro dessa rede, os containers se comunicam pelo **nome do serviço**. O api-gateway não chama `http://localhost:3001` — ele chama `http://auth-service:3001`, porque `auth-service` é o nome do container na rede interna Docker.

---

## 3. NestJS — o framework de cada serviço

Cada serviço é uma aplicação NestJS independente. O NestJS organiza o código em três peças principais:

- **Module** — agrupa tudo que pertence a um domínio (controllers, services, imports)
- **Controller** — recebe as requisições HTTP e define as rotas
- **Provider/Service** — contém a lógica de negócio e acesso ao banco

```typescript
// Exemplo de estrutura de um módulo
@Module({
  imports: [MongooseModule.forFeature([{ name: 'Recurso', schema: RecursoSchema }])],
  controllers: [RecursoController],
  providers: [RecursoService],
})
export class RecursoModule {}
```

```typescript
// Controller define as rotas
@Controller('recursos')
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Get()
  findAll() {
    return this.recursoService.findAll();
  }

  @Post()
  create(@Body() createRecursoDto: CreateRecursoDto) {
    return this.recursoService.create(createRecursoDto);
  }
}
```

O NestJS usa **injeção de dependência**: o service é passado automaticamente pelo framework para o controller via constructor — você não instancia nada manualmente.

---

## 4. Componentes da arquitetura

### API Gateway

O Gateway é o **único ponto de entrada** da aplicação. O mundo externo (Postman, frontend, browser) só conhece o Gateway — nunca acessa os serviços diretamente.

Responsabilidades:
1. **Receber** todas as requisições externas
2. **Validar o JWT** via Guard — token inválido é rejeitado aqui mesmo
3. **Rotear** para o serviço correto com base na URL, repassando a requisição com `HttpService`
4. **Repassar** informações do usuário nos headers internos (`x-user-id`, `x-user-role`)

```
POST /auth/login    → http://auth-service:3001/login
GET  /recurso-a     → http://servico-a:3002/recurso-a
POST /recurso-b     → http://servico-b:3003/recurso-b
```

O cliente nunca sabe que existem múltiplos serviços. Para ele, tudo vem de `localhost:3000`.

### Auth Service

Responsável por tudo relacionado a identidade:
- Registrar usuário (`POST /auth/register`)
- Fazer login e devolver JWT (`POST /auth/login`)

É o **único** serviço que conhece o `JWT_SECRET`. Os outros serviços não validam token — quem faz isso é o Gateway.

### Serviços de negócio

Implementam a lógica da aplicação. Não validam JWT — confiam que, se a requisição chegou, o Gateway já autenticou. Usam o `x-user-id` e `x-user-role` repassados nos headers para saber quem é o usuário e o que ele pode fazer.

---

## 5. Fluxo completo de uma requisição

### Login (rota pública)

```
1. Cliente → POST localhost:3000/auth/login { email, password }
2. Gateway recebe → repassa para auth-service (sem validar token, login não precisa)
3. auth-service verifica email/senha no MongoDB
4. auth-service gera JWT com payload { userId, email, role }
5. auth-service devolve { token: "eyJ..." }
6. Gateway devolve a resposta para o cliente
```

### Requisição autenticada

```
1. Cliente → GET localhost:3000/recurso-a
   Header: Authorization: Bearer eyJ...

2. Guard do Gateway intercepta a requisição
3. Guard verifica o token com JwtService
   → Token inválido: lança UnauthorizedException (401), para aqui
   → Token válido: decodifica { userId: "abc123", role: "user" }

4. Guard adiciona headers internos na requisição de saída:
   x-user-id: abc123
   x-user-role: user

5. Gateway repassa → http://servico-a:3002/recurso-a

6. servico-a lê req.headers['x-user-id']
7. servico-a consulta MongoDB, retorna os dados

8. Gateway devolve a resposta para o cliente
```

---

## 6. JWT — como o token funciona

O JWT (JSON Web Token) tem 3 partes separadas por `.`:

```
eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOiIxMjMifQ . assinatura
       HEADER                   PAYLOAD              SIGNATURE
```

- **Header** — algoritmo de assinatura (HS256)
- **Payload** — dados do usuário. É decodificável por qualquer um, **não coloque senha aqui**
- **Signature** — garante que o token não foi adulterado. Só quem tem o `JWT_SECRET` consegue criar uma assinatura válida

No NestJS, a validação do JWT no Gateway é feita por um **Guard**:

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify(token);
      // injeta nas headers que serão repassadas ao serviço destino
      request.userPayload = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

`UnauthorizedException` do NestJS retorna automaticamente o status **401**.

---

## 7. Autorização — controlando o que cada usuário pode fazer

Autenticação responde "quem é você?". Autorização responde "o que você pode fazer?".

O JWT carrega um campo `role` no payload (ex: `"role": "admin"` ou `"role": "user"`). O Gateway repassa esse valor no header `x-user-role`. Os serviços de negócio usam um **Guard de roles** para decidir se a operação é permitida.

A diferença entre os status:
- **401 Unauthorized** — token ausente ou inválido (não autenticado)
- **403 Forbidden** — token válido, mas sem permissão para aquela ação (não autorizado)

No NestJS, cria-se um decorator customizado e um Guard:

```typescript
// decorator para marcar a role exigida na rota
export const Roles = (role: string) => SetMetadata('role', role);

// guard que lê o header x-user-role e compara com a role exigida
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    if (!requiredRole) return true; // rota sem @Roles() é livre

    const request = context.switchToHttp().getRequest();
    const userRole = request.headers['x-user-role'];

    if (userRole !== requiredRole) throw new ForbiddenException();
    return true;
  }
}
```

Uso no controller:

```typescript
@Delete(':id')
@Roles('admin')
@UseGuards(RolesGuard)
remove(@Param('id') id: string) {
  return this.recursoService.remove(id);
}
```

---

## 8. Comunicação HTTP entre serviços

Quando um serviço precisa chamar outro internamente, usa o `HttpModule` do NestJS (`@nestjs/axios`):

```typescript
// No module do serviço que vai fazer a chamada:
@Module({
  imports: [HttpModule],
  ...
})

// No service:
constructor(private readonly httpService: HttpService) {}

async buscarRecursoExterno(id: string) {
  const { data } = await firstValueFrom(
    this.httpService.get(`${process.env.SERVICO_A_URL}/recurso/${id}`)
  );
  return data;
}
```

A variável `SERVICO_A_URL` vale `http://servico-a:3002` dentro do Docker e `http://localhost:3002` no desenvolvimento local.

---

## 9. Observabilidade — Prometheus e Grafana

### O que é observabilidade?

É a capacidade de entender o que está acontecendo dentro da aplicação em tempo real. Para este projeto, o foco é **métricas**:

- Número de requisições por segundo
- Latência média das respostas
- Taxa de erros por serviço

### Como Prometheus coleta métricas

Prometheus funciona no modelo **pull**: periodicamente vai nos serviços buscar métricas no endpoint `/metrics`.

Em cada serviço NestJS, a lib `prom-client` expõe esse endpoint. A forma mais direta é registrá-lo manualmente no `main.ts`:

```typescript
import { collectDefaultMetrics, Registry } from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const register = new Registry();
  collectDefaultMetrics({ register });

  // endpoint que o Prometheus vai chamar
  app.getHttpAdapter().get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  await app.listen(3001);
}
```

```
Serviço NestJS         Prometheus            Grafana
  GET /metrics  ◄──── coleta a cada 15s ◄── consulta e exibe
```

O `prometheus.yml` diz quais serviços monitorar:

```yaml
scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:3000']

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
```

O Grafana lê do Prometheus e exibe dashboards com gráficos em tempo real.

---

## 10. Testes de carga com k6

O k6 simula múltiplos usuários fazendo requisições simultâneas. Você define quantos usuários virtuais, por quanto tempo, e o que cada usuário faz.

**Exemplo conceitual de script:**

```
Por 30 segundos, com 50 usuários simultâneos:
  1. Faz POST /auth/login
  2. Pega o token da resposta
  3. Faz GET no recurso principal com o token
  4. Faz POST criando um recurso autenticado
  5. Verifica se as respostas foram 200/201

Critério de sucesso: 95% das requisições abaixo de 500ms
```

O objetivo na apresentação é rodar o k6 enquanto o Grafana exibe os gráficos de métricas subindo em tempo real — isso demonstra que autenticação, serviços e observabilidade estão funcionando de ponta a ponta.

---

## 11. Por que separar domínios?

Para justificar o uso de microsserviços, os domínios precisam ser **naturalmente independentes**. A divisão mínima esperada é:

| Serviço | Domínio | Responsabilidade |
|---------|---------|-----------------|
| api-gateway | Entrada | Como o mundo acessa tudo |
| auth-service | Identidade | Quem é o usuário |
| serviço de negócio A | Domínio principal | Recurso central da aplicação |
| serviço de negócio B | Domínio relacionado | Recurso que depende ou complementa A |

Cada um pode evoluir, ser deployado e escalar independentemente. Se um serviço de negócio cair, o login ainda funciona. Se um serviço específico precisar de mais recursos, só ele é escalado.

---

## 12. Documentação com Swagger

O `@nestjs/swagger` gera uma página interativa automaticamente a partir dos decorators já usados no código — sem precisar escrever YAML ou comentários separados.

A configuração fica no `main.ts` do **api-gateway**:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Documentação centralizada dos microsserviços')
    .setVersion('1.0')
    .addBearerAuth() // habilita o campo de token na UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
```

Nos controllers, decorators descrevem cada endpoint:

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {

  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 200, description: 'Token JWT gerado' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {}
}
```

Nos DTOs, os campos ficam documentados automaticamente com `@ApiProperty`:

```typescript
export class LoginDto {
  @ApiProperty({ example: 'usuario@email.com' })
  email: string;

  @ApiProperty({ example: '123456' })
  password: string;
}
```

Resultado: `localhost:3000/api-docs` exibe a documentação interativa completa.

O mínimo esperado: descrição de cada endpoint, campos de entrada com tipos, respostas possíveis e quais rotas exigem token (cadeado na UI).

---

## 13. Deploy

O projeto precisa funcionar em algum ambiente além da máquina de desenvolvimento. As opções são deploy local (via docker-compose na própria máquina) ou em nuvem.

### Deploy local

É o mais simples e suficiente para a apresentação. Qualquer pessoa que clonar o repositório consegue subir tudo com:

```bash
git clone https://github.com/seu-usuario/projeto.git
cd projeto
cp .env.example .env   # preencher as variáveis
docker-compose up -d
```

### Deploy em nuvem

Para expor a aplicação na internet, as plataformas mais simples para NestJS + Docker são:

| Plataforma | O que oferece | Observação |
|---|---|---|
| **Render** | deploy de containers Docker, plano gratuito | boa opção para o projeto |
| **Railway** | deploy via GitHub, suporte a MongoDB | simples de configurar |
| **Fly.io** | containers Docker, boa performance | requer cartão de crédito no cadastro |

O fluxo geral em qualquer uma delas:
1. Fazer push do código para o GitHub
2. Conectar o repositório na plataforma
3. Configurar as variáveis de ambiente (`.env`) no painel da plataforma
4. A plataforma lê o `Dockerfile` e faz o build automaticamente

Para o trabalho, deploy local já é suficiente. Se quiser deixar acessível para o avaliador testar remotamente, Render ou Railway são as opções mais rápidas de configurar.
