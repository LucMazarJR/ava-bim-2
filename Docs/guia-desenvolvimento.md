# Guia de Desenvolvimento em Grupo

> Como o time vai trabalhar junto | Git + Docker + Organização

---

## Checklist geral do projeto

### Planejamento
- [ ] Escolher o tema e definir os domínios de cada serviço
- [ ] Mapear os endpoints de cada serviço
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
- [ ] Validação de JWT (retorna 401 se token inválido ou ausente)
- [ ] Roteamento para todos os serviços
- [ ] Headers internos repassados (`x-user-id`, `x-user-role`)
- [ ] Documentação Swagger em `/api-docs` cobrindo todos os endpoints
- [ ] Endpoint `/metrics` exposto

### Serviços de negócio
- [ ] Cada serviço com seu CRUD implementado
- [ ] Rotas protegidas por role (403 para quem não tem permissão)
- [ ] Regras de negócio do domínio funcionando
- [ ] Comunicação entre serviços onde necessário
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
# Criar a pasta do projeto localmente
mkdir projeto-microsservicos
cd projeto-microsservicos

# Inicializar o Git
git init

# Criar o arquivo .gitignore
echo "node_modules/\n.env\n.DS_Store" > .gitignore

# Criar o .env.example (sem valores reais — só as chaves)
echo "JWT_SECRET=\nDB_URI=\nSERVICO_A_URL=\nSERVICO_B_URL=" > .env.example

# Primeiro commit
git add .
git commit -m "chore: estrutura inicial do projeto"

# Conectar ao repositório remoto (criar no GitHub antes)
git remote add origin https://github.com/seu-usuario/projeto-microsservicos.git
git push -u origin main
```

### 2. Cada pessoa clona e cria sua branch

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/projeto-microsservicos.git
cd projeto-microsservicos

# Criar e entrar na sua branch
git checkout -b feature/nome-do-servico
```

---

## Fluxo de trabalho diário

### Começando — sincronizar com o que o time fez

```bash
# Ir para a main e puxar as últimas mudanças
git checkout main
git pull origin main

# Voltar para sua branch e trazer as mudanças da main
git checkout feature/nome-do-servico
git merge main
```

Faça isso antes de começar a trabalhar. Evita conflitos grandes no final.

### Salvando o progresso — commit frequente

```bash
# Ver o que mudou
git status

# Adicionar arquivos específicos (prefira isso a git add .)
git add src/controllers/meuController.js
git add src/models/MeuModel.js

# Criar o commit com mensagem descritiva
git commit -m "feat: implementar rota de listagem com paginação"

# Enviar para o repositório remoto
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

### Dockerfile padrão para cada serviço

Cada serviço tem seu próprio `Dockerfile` na raiz da sua pasta. O conteúdo é basicamente o mesmo para todos — só muda a porta exposta:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

Defina as portas de cada serviço antes de começar e alinhe com o time para não ter conflito.

### docker-compose.yml — estrutura base

```yaml
services:

  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - SERVICO_A_URL=http://servico-a:3001
      - SERVICO_B_URL=http://servico-b:3002
    depends_on:
      - servico-a
      - servico-b

  auth-service:
    build: ./auth-service
    environment:
      - DB_URI=${DB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database

  servico-a:
    build: ./servico-a
    environment:
      - DB_URI=${DB_URI}
    depends_on:
      - database

  servico-b:
    build: ./servico-b
    environment:
      - DB_URI=${DB_URI}
      - SERVICO_A_URL=http://servico-a:3001
    depends_on:
      - database
      - servico-a

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

### Arquivo .env na raiz

```
JWT_SECRET=uma_chave_secreta_longa_e_aleatoria
DB_URI=mongodb://database:27017/projeto
```

Nunca commite o `.env` — ele já está no `.gitignore`. Cada membro cria o seu localmente com base no `.env.example`.

---

## Comandos Docker essenciais

```bash
# Subir todos os containers em background
docker-compose up -d

# Ver os logs de um serviço específico
docker-compose logs -f nome-do-servico

# Parar tudo
docker-compose down

# Parar e apagar os volumes (reseta o banco)
docker-compose down -v

# Rebuild de um serviço após mudança de código
docker-compose up -d --build nome-do-servico

# Ver status dos containers
docker-compose ps
```

---

## Testando seu serviço isolado

Antes de integrar no docker-compose completo, suba só o banco e seu serviço:

```bash
# Subir só o banco e seu serviço
docker-compose up -d database nome-do-servico

# Testar com curl
curl -X POST http://localhost:3001/sua-rota \
  -H "Content-Type: application/json" \
  -d '{"campo": "valor"}'
```

Quando estiver funcionando isolado, avise o time para integrar no compose completo.

---

## Comunicação interna entre serviços

Dentro da rede Docker, use o nome do container como hostname. O serviço B chamando o serviço A:

```javascript
const response = await fetch(
  `${process.env.SERVICO_A_URL}/recurso/${id}`
);
const data = await response.json();
```

A variável `SERVICO_A_URL` vale `http://servico-a:3001` quando rodando via docker-compose, e `http://localhost:3001` quando testando localmente sem Docker.

---

## Dicas para evitar conflitos

- **Não mexa em arquivos de outros serviços.** Se precisar, converse antes
- **O `docker-compose.yml` é compartilhado** — alinhem antes de fazer merge de mudanças nele
- **Antes de abrir PR**, rode `docker-compose up --build` localmente e confirme que tudo sobe
- **Variável de ambiente nova**: adicione ao `.env.example` antes de fazer merge — o time precisa saber que ela existe
