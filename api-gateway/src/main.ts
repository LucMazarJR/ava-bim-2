import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription(
      'Porta de entrada externa da aplicação. Roteia as requisições para os microsserviços internos (auth-service e user-service).',
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
