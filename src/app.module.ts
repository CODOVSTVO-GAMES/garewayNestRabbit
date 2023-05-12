import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionModule } from './session/session.module';
import { RabbitModule } from './rabbit/rabbit.module';
import { LoggerMiddleware } from './logget'
import { DataStorageModule } from './data-storage/data-storage.module';

@Module({
  imports: [SessionModule, RabbitModule, DataStorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
