# Guia de Desenvolvimento em Grupo

> Como o time vai trabalhar junto | Git + NestJS + Docker + Organização

---

## Estrutura do projeto — polyrepo em um único repositório

Cada serviço é uma **aplicação NestJS completamente independente**: tem seu próprio `package.json`, seu próprio `node_modules`, seu próprio `tsconfig.json`. Elas vivem em pastas separadas dentro do mesmo repositório GitHub.

```
ava-bim-2/
│
├── .gitignore              ← ignora node_modules/ e .env em qualquer subpasta
├── .env.example
├── docker-compose.yml      ← orquestra todos os containers
├── readme.md
│
├── api_gateway/            ← NestJS app independente
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── auth_service/           ← NestJS app independente
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── user-service/           ← NestJS app independente (configurado)
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── Dockerfile
│
├── monitoring/
│   └── prometheus.yml
│
└── Docs/
```

O `docker-compose.yml` e os arquivos da raiz são compartilhados pelo time inteiro. Cada pasta de serviço pertence a uma pessoa.

---

## Checklist geral do projeto

### Planejamento
- [ ] Escolher o tema e definir os domínios de cada serviço
- [ ] Mapear os endpoints de cada serviço
- [ ] Definir as portas de cada serviço (para não conflitar)
- [ ] Dividir responsabilidades entre o time

### Infraestrutura e base
- [ ] Criar repositório no GitHub com todos como colaboradores
- [ ] Definir estrutura de pastas e criar branches por serviço
- [ ] Criar `.env.example` com todas as variáveis necessárias
- [ ] `docker-compose.yml` com banco de dados rodando
- [ ] `Dockerfile` funcionando para cada serviço
- [ ] `docker-compose up` sobe tudo sem erro

### Auth Service
- [ ] Registro de usuário
- [ ] Login com geração de JWT
- [ ] Endpoint `/metrics` exposto

### API Gateway
- [ ] Guard de JWT (retorna 401 se token inválido ou ausente)
- [ ] Roteamento para todos os serviços via `HttpService`
- [ ] Headers internos repassados (`x-user-id`, `x-user-role`)
- [ ] Documentação Swagger em `/api-docs` cobrindo todos os endpoints
- [ ] Endpoint `/metrics` exposto

### Serviços de negócio
- [ ] Cada serviço com seu CRUD implementado
- [ ] `RolesGuard` protegendo rotas que exigem permissão (403 para não autorizados)
- [ ] Regras de negócio do domínio funcionando
- [ ] Comunicação HTTP entre serviços onde necessário
- [ ] Endpoint `/metrics` exposto em cada um

### Observabilidade
- [ ] Prometheus coletando métricas de todos os serviços
- [ ] Dashboard no Grafana com requisições/s, latência e erros
- [ ] Script de teste de carga (k6) cobrindo o fluxo principal

### Deploy
- [ ] `docker-compose up` sobe tudo a partir de um clone limpo do repositório
- [ ] `.env.example` preenchido o suficiente para qualquer pessoa rodar o projeto
- [ ] (opcional) serviços publicados em nuvem (Render, Railway, etc.)

### Apresentação
- [ ] Fluxo completo funcionando via Gateway
- [ ] Swagger acessível mostrando todos os endpoints documentados
- [ ] k6 rodando ao vivo com métricas aparecendo no Grafana

---

## Organização do repositório Git

### Serviços e branches

| Serviço | Pasta | Branch | Porta externa |
|---|---|---|---|
| API Gateway | `api_gateway/` | `gateway` | 3000 |
| Autenticação | `auth_service/` | `auth` | — |
| Usuários | `user-service/` | `user` | 3001 |

```
main
├── user        ← user-service (usuários e perfis)
├── auth        ← auth_service (autenticação e JWT)
├── gateway     ← api_gateway (entrada, roteamento, Swagger)
└── menu        ← [serviço de negócio adicional]
```

Regra simples: **cada pessoa trabalha na sua branch**. O `docker-compose.yml` e arquivos da raiz ficam na `main` e são atualizados via Pull Request conforme cada serviço é integrado.

```bash
# Clonar o repositório
git clone https://github.com/usuario/ava-bim-2.git
cd ava-bim-2

# Criar sua branch (nome do serviço, sem prefixo)
git checkout -b user

# Publicar a branch no GitHub pela primeira vez
git push -u origin user

# Nas próximas vezes, só:
git push

# Ver todas as branches (locais e remotas)
git branch -a

# Trocar de branch
git checkout main
git checkout user
```

### Convenção de mensagens de commit

Os commits usam **conventional commits escopados** — o escopo identifica o serviço:

```
tipo(escopo): descrição curta
```

| Prefixo | Quando usar |
|---------|-------------|
| `feat(user):` | nova funcionalidade no user-service |
| `feat(auth):` | nova funcionalidade no auth_service |
| `feat(gateway):` | nova funcionalidade no api_gateway |
| `fix(user):` | correção de bug |
| `chore(user):` | configuração, dependências |
| `docs:` | documentação (sem escopo de serviço) |
| `refactor(auth):` | refatoração sem mudar comportamento |

Exemplos reais do projeto:

```bash
git commit -m "feat(user): add docker file and init docker compose"
git commit -m "chore(user): initial service configuration"
git commit -m "chore(gateway): init api_gateway service"
git commit -m "docs: update documentation for nest.js"
```

---

## Como rodar o projeto

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- Node.js 22+ (para desenvolvimento local fora do Docker)

### Do zero

```bash
git clone <url-do-repo>
cd ava-bim-2

# Copiar e preencher o .env de cada serviço
cp user-service/.env.example user-service/.env
# ... repetir para cada serviço configurado

# Subir tudo
docker-compose up -d
```

### Verificar endpoints

```
http://localhost:3000   → api_gateway
http://localhost:3001   → user-service
```

---

## Primeiros passos — criando seu serviço

### 1. Criar o projeto NestJS

Na raiz do repositório, na sua branch:

```bash
# Instalar o CLI do NestJS (uma vez só, global)
npm install -g @nestjs/cli

# Criar o projeto NestJS na pasta do seu serviço
nest new nome-do-servico --skip-git

# O CLI vai criar a pasta com tudo configurado:
# src/app.module.ts, src/main.ts, package.json, tsconfig.json, etc.
```

A flag `--skip-git` é importante — evita que o NestJS crie um repositório Git separado dentro da pasta do serviço.

### 2. Rodar localmente

```bash
cd nome-do-servico
npm run start:dev   # modo watch, reinicia ao salvar
```

---

## Fluxo de trabalho diário

### Começando — sincronizar com o que o time fez

```bash
git checkout main
git pull origin main

git checkout user   # sua branch
git merge main
```

Faça isso antes de começar a trabalhar. Evita conflitos grandes no final.

### Salvando o progresso — commit frequente

```bash
git status

# Adicionar arquivos específicos (nunca git add -A cegamente)
git add user-service/src/users/users.service.ts
git add user-service/src/users/users.controller.ts

git commit -m "feat(user): implementar CRUD de usuários"

git push origin user
```

### Abrindo Pull Request — quando o serviço estiver pronto

1. Acesse o repositório no GitHub
2. Clique em **"Compare & pull request"** na sua branch
3. Título direto: `feat(user): user-service completo`
4. Descrição: o que foi implementado e como testar
5. Peça para alguém do time revisar antes de fazer merge na `main`

---

## Criando os containers Docker

### Dockerfile

O projeto usa **dois estágios** no Dockerfile: `development` (com hot reload) e `production` (compilado, imagem menor). O `docker-compose.yml` seleciona o estágio via `target`.

```dockerfile
# Estágio de desenvolvimento — hot reload ativo
FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# npm install roda novamente ao iniciar para pegar dependências novas
# sem precisar recriar a imagem
CMD ["sh", "-c", "npm install && npm run start:dev"]

# [TODO] - Adicionar estágio de produção:
# FROM node:22-alpine AS production
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --omit=dev
# COPY --from=development /usr/src/app/dist ./dist
# CMD ["node", "dist/main"]
```

### docker-compose.yml — padrão por serviço

Cada serviço segue o mesmo padrão: uma entrada para a aplicação (`<nome>-app`) e uma para o banco (`<nome>-db`). O volume duplo no serviço app garante o hot reload sem perder o `node_modules` do container.

```yaml
services:

  api-gateway:
    build:
      context: ./api-gateway
      target: development        # usa o estágio de dev do Dockerfile
    ports:
      - "3000:3000"
    environment:
      - CHOKIDAR_USEPOLLING=true # necessário no Windows — o Docker não repassa eventos
                                 # de arquivo do host, então o watcher usa polling
      - JWT_SECRET=${JWT_SECRET}
      - SERVICO_A_URL=http://servico-a:3002
      - SERVICO_B_URL=http://servico-b:3003
    volumes:
      - ./api-gateway:/usr/src/app        # monta o código do host → hot reload funciona
      - /usr/src/app/node_modules         # volume anônimo: protege o node_modules do container
    depends_on:
      - auth-service
      - servico-a
      - servico-b

  auth-service:
    build:
      context: ./auth-service
      target: development
    environment:
      - CHOKIDAR_USEPOLLING=true
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./auth-service:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - database

  servico-a:
    build:
      context: ./servico-a
      target: development
    environment:
      - CHOKIDAR_USEPOLLING=true
      - MONGO_URI=${MONGO_URI}
    volumes:
      - ./servico-a:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - database

  database:
    image: mongo:7
    ports:
      - "300X:3000"                  # porta externa:interna (3000 é o padrão NestJS)
    volumes:
      - ./nome-do-servico:/usr/src/app   # monta o código → hot reload
      - /usr/src/app/node_modules        # preserva o node_modules do container
    depends_on:
      - nome-db

  nome-db:
    image: mongo
    env_file:
      - ./nome-do-servico/.env
    volumes:
      - nome-data:/data/db

volumes:
  nome-data:
```

> **Por que dois volumes por serviço?**
> - `./servico:/usr/src/app` — sincroniza o código do host com o container em tempo real (hot reload)
> - `/usr/src/app/node_modules` — volume anônimo que "blinda" a pasta `node_modules` dentro do container, impedindo que o `node_modules` local do Windows sobrescreva o que foi instalado no Linux alpine
>
> **Por que `CHOKIDAR_USEPOLLING=true`?**
> No Windows, o Docker Desktop não propaga eventos `inotify` do filesystem do host para o container Linux. Ferramentas que usam `chokidar` (como alguns middlewares de watch) respeitam essa variável e passam a usar polling. Porém, essa variável **não afeta o `nest start --watch`**, pois ele usa o compilador TypeScript diretamente, que tem seu próprio sistema de watch.
>
> **Por que adicionar `watchOptions` no `tsconfig.json`?**
> O `nest start --watch` usa o TypeScript Compiler em modo watch, que por padrão depende de `inotify` — eventos que nunca chegam dentro do container quando os arquivos estão num volume montado do Windows. Para corrigir, é necessário configurar o TypeScript para usar polling:
>
> ```json
> // tsconfig.json — adicionar fora de "compilerOptions"
> "watchOptions": {
>   "watchFile": "fixedPollingInterval",
>   "watchDirectory": "fixedPollingInterval",
>   "fallbackPolling": "fixedinterval"
> }
> ```
>
> Com isso, o compilador verifica os arquivos em intervalos fixos em vez de esperar por eventos do sistema operacional. Esse bloco deve estar presente no `tsconfig.json` de **cada serviço** que rode dentro do Docker em modo watch.
>
> **Por que `npm install` no CMD?**
> Com o volume montado, o `package.json` do host fica visível no container. Toda vez que o container sobe, ele instala as dependências novas automaticamente — sem precisar recriar a imagem ao adicionar um pacote.

### Arquivo .env na raiz

```
# Credenciais MongoDB
MONGO_INITDB_ROOT_USERNAME=
MONGO_INITDB_ROOT_PASSWORD=
MONGODB_URI=mongodb://usuario:senha@nome-db:27017/nomedb?authSource=admin

# Porta interna do NestJS
PORT=3000
```

Nunca commite o `.env` — ele já está no `.gitignore`. Cada membro cria o seu localmente com base no `.env.example`.

---

## Comandos Docker essenciais

```bash
# Subir todos os containers em background
docker compose up -d

# Subir e rebuildar imagens após mudança de código
docker-compose up -d --build

# Ver os logs de um serviço específico
docker compose logs -f nome-do-servico

# Parar tudo
docker compose down

# Parar e apagar os volumes (reseta o banco)
docker compose down -v

# Rebuild de uma imagem (necessário ao mudar o Dockerfile)
docker compose up -d --build nome-do-servico

# Ver status dos containers
docker compose ps
```

> **Quando precisar de `--build`?**
> Com o setup de volumes + `npm install` no CMD, a maioria das situações **não** exige rebuild:
> - **Mudança de código** → hot reload cuida automaticamente
> - **Nova dependência** (`npm install pacote`) → basta reiniciar o container: `docker compose restart nome-do-servico`
> - **Mudança no Dockerfile** → aí sim precisa do `--build`

---

## Testando seu serviço isolado

Durante o desenvolvimento, você não precisa subir todos os containers. Suba só o banco e seu serviço:

```bash
# Sobe só o banco e o serviço em desenvolvimento
docker-compose up -d users-db users-app

# Ou rode localmente sem Docker (mais rápido no dia a dia):
cd user-service
npm run start:dev
```

O NestJS em modo `start:dev` usa hot reload — reinicia automaticamente ao salvar arquivos.

Para conectar localmente sem Docker, configure `MONGODB_URI=mongodb://localhost:27017/users` no `.env` do serviço e suba só o MongoDB via Docker.

Quando estiver funcionando isolado, avise o time para integrar no compose completo.

---

## Comunicação interna entre serviços

O módulo `HttpModule` do NestJS (`@nestjs/axios`) é a forma recomendada para chamar outros serviços internamente.

```typescript
// No module:
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
})

// No service:
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

constructor(private readonly httpService: HttpService) {}

async buscarRecurso(id: string) {
  const { data } = await firstValueFrom(
    this.httpService.get(`${process.env.USER_SERVICE_URL}/users/${id}`)
  );
  return data;
}
```

Dentro do Docker, a URL é o **nome do serviço no docker-compose**: `http://users-app:3000`. No desenvolvimento local, é `http://localhost:3001`.

---

## Dicas para evitar conflitos

- **Não mexa em arquivos de outros serviços.** Se precisar, converse antes
- **O `docker-compose.yml` é compartilhado** — alinhem antes de fazer merge de mudanças nele
- **Antes de abrir PR**, rode `docker-compose up --build` localmente e confirme que tudo sobe
- **Variável de ambiente nova**: adicione ao `.env.example` do serviço antes de fazer merge
- **Nunca commite `node_modules/`** — o `.gitignore` já cobre, mas confirme antes do primeiro push de cada serviço
- **Nunca commite `.env`** — use `.env.example` como referência para o time
