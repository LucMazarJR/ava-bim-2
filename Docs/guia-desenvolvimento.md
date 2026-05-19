# Guia de Desenvolvimento em Grupo

> Como o time vai trabalhar junto | Git + NestJS + Docker + Organização

---

## Estrutura do projeto — polyrepo em um único repositório

Cada serviço é uma **aplicação NestJS completamente independente**: tem seu próprio `package.json`, seu próprio `node_modules`, seu próprio `tsconfig.json`. Elas vivem em pastas separadas dentro do mesmo repositório GitHub.

```
projeto-microsservicos/
│
├── .gitignore              ← ignora node_modules/ e .env em qualquer subpasta
├── .env.example
├── docker-compose.yml      ← orquestra todos os containers
│
├── api-gateway/            ← NestJS app independente
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── auth-service/           ← NestJS app independente
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── servico-a/              ← NestJS app independente
│   └── ...
│
├── monitoring/
│   └── prometheus.yml
│
└── tests/
    └── load/
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

### Estrutura de branches

```
main
├── feature/infra-docker        ← docker-compose base, Dockerfiles
├── feature/api-gateway         ← gateway e roteamento
├── feature/auth-service        ← serviço de autenticação
├── feature/[servico-1]         ← primeiro serviço de negócio
├── feature/[servico-2]         ← segundo serviço de negócio
└── feature/observabilidade     ← Prometheus, Grafana, k6
```

Regra simples: **cada pessoa trabalha na sua branch**. O `docker-compose.yml` e arquivos da raiz ficam na `main` e são atualizados via Pull Request conforme cada serviço é integrado.

---

## Primeiros passos — configurando o repositório

### 1. Quem cria o repositório

```bash
mkdir projeto-microsservicos
cd projeto-microsservicos

git init

# .gitignore na raiz — cobre node_modules e .env em qualquer subpasta
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
*.log
dist/
EOF

# .env.example com as chaves necessárias (sem valores)
cat > .env.example << 'EOF'
JWT_SECRET=
MONGO_URI=
SERVICO_A_URL=
SERVICO_B_URL=
EOF

git add .
git commit -m "chore: estrutura inicial do projeto"

git remote add origin https://github.com/seu-usuario/projeto-microsservicos.git
git push -u origin main
```

### 2. Cada pessoa clona e cria sua branch

```bash
git clone https://github.com/seu-usuario/projeto-microsservicos.git
cd projeto-microsservicos

git checkout -b feature/nome-do-servico
```

### 3. Criar o projeto NestJS do seu serviço

Dentro da pasta do repositório, na sua branch:

```bash
# Instalar o CLI do NestJS (uma vez só, global)
npm install -g @nestjs/cli

# Criar o projeto NestJS na pasta do seu serviço
nest new auth-service --skip-git

# O CLI vai criar a pasta auth-service/ com tudo configurado:
# src/app.module.ts, src/main.ts, package.json, tsconfig.json, etc.
```

A flag `--skip-git` é importante — evita que o NestJS crie um repositório Git separado dentro da pasta do serviço.

Depois de criar, o serviço já roda localmente:

```bash
cd auth-service
npm run start:dev   # modo watch, reinicia ao salvar
```

---

## Fluxo de trabalho diário

### Começando — sincronizar com o que o time fez

```bash
git checkout main
git pull origin main

git checkout feature/nome-do-servico
git merge main
```

Faça isso antes de começar a trabalhar. Evita conflitos grandes no final.

### Salvando o progresso — commit frequente

```bash
git status

# Adicionar arquivos específicos
git add auth-service/src/auth/auth.service.ts
git add auth-service/src/auth/auth.controller.ts

git commit -m "feat: implementar rota de login com geração de JWT"

git push origin feature/nome-do-servico
```

### Convenção de mensagens de commit

| Prefixo | Quando usar |
|---------|-------------|
| `feat:` | nova funcionalidade |
| `fix:` | correção de bug |
| `chore:` | configuração, dependências |
| `docs:` | documentação |
| `refactor:` | refatoração sem mudar comportamento |

### Abrindo Pull Request — quando o serviço estiver pronto

1. Acesse o repositório no GitHub
2. Clique em **"Compare & pull request"** na sua branch
3. Título direto: `feat: [nome-do-servico] completo`
4. Descrição: o que foi implementado e como testar
5. Peça para alguém do time revisar antes de fazer merge na `main`

---

## Criando os containers Docker

### Dockerfile para serviços NestJS

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

Troque a porta (`EXPOSE`) conforme o serviço. Defina as portas no início do projeto e alinhe com o time.

### docker-compose.yml — estrutura base

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
      - "27017:27017"
    volumes:
      - db-data:/data/db

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3030:3000"
    depends_on:
      - prometheus

volumes:
  db-data:
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
JWT_SECRET=uma_chave_secreta_longa_e_aleatoria
MONGO_URI=mongodb://database:27017/projeto
```

Nunca commite o `.env` — ele já está no `.gitignore`. Cada membro cria o seu localmente com base no `.env.example`.

---

## Comandos Docker essenciais

```bash
# Subir todos os containers em background
docker compose up -d

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
docker-compose up -d database auth-service

# Ou rode localmente sem Docker (mais rápido no dia a dia):
cd auth-service
npm run start:dev
```

O NestJS em modo `start:dev` usa o Mongoose para conectar no MongoDB. Para isso, configure um `.env` local dentro da pasta do serviço com `MONGO_URI=mongodb://localhost:27017/auth` e suba só o MongoDB via Docker.

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
    this.httpService.get(`${process.env.SERVICO_A_URL}/recurso/${id}`)
  );
  return data;
}
```

A variável `SERVICO_A_URL` vale `http://servico-a:3002` dentro do Docker e `http://localhost:3002` no desenvolvimento local.

---

## Dicas para evitar conflitos

- **Não mexa em arquivos de outros serviços.** Se precisar, converse antes
- **O `docker-compose.yml` é compartilhado** — alinhem antes de fazer merge de mudanças nele
- **Antes de abrir PR**, rode `docker-compose up --build` localmente e confirme que tudo sobe
- **Variável de ambiente nova**: adicione ao `.env.example` antes de fazer merge
- **Nunca commite `node_modules/`** — o `.gitignore` já cobre, mas confirme antes do primeiro push de cada serviço
