import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startServer } from '@aries-framework/rest'
import { initializeIssuingAgent } from './issuingAgent';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
