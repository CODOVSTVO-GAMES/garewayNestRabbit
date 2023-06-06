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
import { UserModule } from './user/user.module';
import { PaymentsModule } from './payments/payments.module';
import { ErrorhandlerModule } from './others/errorhandler/errorhandler.module';
import { ConfigModule } from './config/config.module';
import { MapModule } from './map/map.module';

@Module({
    imports: [SessionModule, RabbitModule, DataStorageModule, EventsModule, MonitoringModule, UserModule, PaymentsModule, ErrorhandlerModule, ConfigModule, MapModule],
    controllers: [AppController],
    providers: [AppService, CryptoService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(DataIntegrityMiddleware)
            .forRoutes('session', 'user');

        consumer
            .apply(DataIntegrityMiddleware, SessionValidationMiddleware)
            .exclude('session', 'user', 'payments/okCallback')
            .forRoutes('*');
    }
}
