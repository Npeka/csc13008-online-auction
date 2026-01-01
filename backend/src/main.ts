import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('HTTP');

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // HTTP Request Logger Middleware
  app.use((req, res, next) => {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        logger.error(logMessage);
      } else if (statusCode >= 400) {
        logger.warn(logMessage);
      } else {
        logger.log(logMessage);
      }
    });

    next();
  });

  // Set global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
