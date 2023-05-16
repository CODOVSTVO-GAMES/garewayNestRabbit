import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionModule } from './session/session.module';
import { RabbitModule } from './others/rabbit/rabbit.module';
import { DataStorageModule } from './data-storage/data-storage.module';
import { CryptoService } from './others/crypto/crypto.service';
import { DataIntegrityMiddleware } from './others/midlevares/data-integrity/data-integrity.middleware';
import { SessionValidationMiddleware } from './others/midlevares/session-validation/session-validation.middleware';
import { EventsModule } from './events/events.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
    imports: [SessionModule, RabbitModule, DataStorageModule, EventsModule, MonitoringModule],
    controllers: [AppController],
    providers: [AppService, CryptoService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(DataIntegrityMiddleware)
            .forRoutes('session');

        consumer
            .apply(DataIntegrityMiddleware, SessionValidationMiddleware)
            .exclude('session')
            .forRoutes('*');
    }
}
