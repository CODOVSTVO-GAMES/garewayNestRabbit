import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
  ClientsModule.register([
    {
      name: 'session-module',
      transport: Transport.RMQ,
      options: {
          urls: ['amqp://test:test@rabbit:5672'],
        queue: 'to_session_service'
      },
    },
  ]),
],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
