
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { delay } from 'rxjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(9600);
}
bootstrap();
