import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription(
      'Porta de entrada externa da aplicação. Roteia as requisições para os microsserviços internos.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o token JWT obtido no endpoint POST /auth/login',
      },
      'JWT',
    )
    .addTag('Auth', 'Autenticação de usuários')
    .addTag('User', 'Gerenciamento de usuários')
    .addTag('Restaurant', 'Gerenciamento de restaurantes')
    .addTag('Orders', 'Gerenciamento de pedidos')
    .addTag('Delivery', 'Gerenciamento de entregas')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({ origin: '*' });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
