import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para todas las solicitudes
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Añadir prefijo global 'api' a todas las rutas
  app.setGlobalPrefix('api');

  // Iniciar servidor en el puerto 4002
  await app.listen(process.env.PORT || 4002);

  console.log(`Servidor NestJS iniciado en: ${await app.getUrl()}`);
}
bootstrap();
