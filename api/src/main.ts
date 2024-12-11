import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Use require syntax for cookie-parser
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port = app.get(ConfigService).get<number>('PORT');
  await app.listen(port);
  console.log(`Listening on ${port}`);
}

bootstrap();
