# [TODO] - Adicionar estágios para prod

# Docker file de desenvolvimento
FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "-c", "npm install && npm run start:dev"]
