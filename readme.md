# Food Delivery — Microsserviços

Plataforma de delivery de comida sendo construída do zero para aprender arquitetura de microsserviços na prática: como separar domínios, fazer serviços conversarem, proteger rotas com JWT e monitorar tudo rodando.

> **Em desenvolvimento.** User service, auth service e API Gateway implementados com padrões completos (DTOs, validação, Swagger, JWT Guard). Menu service e observabilidade são os próximos passos.

---

## O que estamos aprendendo

O projeto existe para colocar a mão na massa em tecnologias que aparecem em qualquer stack backend moderno:

- **NestJS** — como estruturar uma API com módulos, controllers, services e injeção de dependência
- **Docker** — como containerizar serviços e fazê-los conversar numa rede interna sem expor tudo para fora
- **JWT** — como autenticação stateless funciona de verdade: assinar tokens, validar, carregar dados do usuário sem bater no banco a cada requisição
- **API Gateway** — por que existe um ponto de entrada único, Guards globais e o decorator `@Public()` para rotas abertas
- **MongoDB** — banco orientado a documentos, um por serviço para manter o isolamento
- **class-validator** — como DTOs validam entrada de dados automaticamente via `ValidationPipe` global
- **Prometheus + Grafana** — como coletar e visualizar métricas de múltiplos serviços em tempo real
- **k6** — como simular carga e ver o sistema se comportar sob pressão

---

## O projeto

Uma plataforma de delivery simples com serviços separados por domínio:

```
  Cliente/Postman ──────► gateway-app :3000
                                │
                                ├──► auth-app    :3002  (interno: 3000)
                                ├──► users-app   :3001  (interno: 3000)
                                └──► menu-app    :3003  (interno: 3000) ← próximo passo

  users-db  (MongoDB)
  prometheus :9090
  grafana    :3030
```

Tudo orquestrado via Docker Compose. O cliente só conhece o Gateway — nunca acessa os serviços diretamente.

---

## Serviços

| Serviço | Pasta | Porta externa | Status |
|---|---|---|---|
| API Gateway | `api-gateway/` | 3000 | ✅ Implementado |
| Auth Service | `auth-service/` | 3002 | ✅ Implementado |
| User Service | `user-service/` | 3001 | ✅ Implementado |
| Menu Service | `menu-service/` | 3003 | 🔲 Próximo passo |

### User Service
Gerencia usuários da plataforma. CRUD completo com MongoDB, senhas hasheadas com bcrypt. Expõe busca por e-mail (rota interna usada pelo auth-service). Swagger disponível em `localhost:3001/api`.

### Auth Service
Recebe e-mail e senha, busca o usuário no user-service via HTTP interno, valida a senha e devolve um JWT assinado. Único serviço que conhece o `JWT_SECRET`. Swagger em `localhost:3002/api`.

### API Gateway
Ponto de entrada único. Guard JWT global protege todas as rotas — use `@Public()` para abrir exceções. Roteia para user-service e auth-service via `HttpService`. Swagger centralizado em `localhost:3000/api`.

### Menu Service
Vai gerenciar restaurantes e cardápios. Dono pode editar o próprio cardápio; clientes só consultam. Vai usar o decorator `@Roles()` + `RolesGuard` para controle de permissão.

---

## Como rodar

Só precisa ter Docker instalado.

```bash
git clone https://github.com/LucMazarJR/ava-bim-2.git
cd ava-bim-2

# Cada serviço tem seu próprio .env
cp api-gateway/.env.example  api-gateway/.env
cp user-service/.env.example user-service/.env
cp auth-service/.env.example auth-service/.env
# Preencher as variáveis nos .env criados

docker-compose up -d
```

```bash
# Ver status dos containers
docker-compose ps

# Logs de um serviço
docker-compose logs -f auth-app

# Rebuild após mudar dependência
docker-compose up -d --build

# Derrubar tudo (preserva os bancos)
docker-compose down

# Derrubar e resetar os bancos
docker-compose down -v
```

### Swagger por serviço

| Serviço | URL do Swagger |
|---|---|
| API Gateway | http://localhost:3000/api |
| User Service | http://localhost:3001/api |
| Auth Service | http://localhost:3002/api |

---

## Documentação

- [Conceitos de microsserviços](Docs/conceitos-microsservicos.md) — teoria por trás das decisões de arquitetura, com os padrões reais usados no projeto
- [Guia de desenvolvimento](Docs/guia-desenvolvimento.md) — Git, Docker, padrões estabelecidos e como continuar desenvolvendo o menu-service
