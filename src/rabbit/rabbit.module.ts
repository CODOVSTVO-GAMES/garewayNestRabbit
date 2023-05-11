
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbit.servicve';
@Module({
    imports: [
        ClientsModule.register([
          {
            name: 'session-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@rabbit:5672'],
              queue: 'to_session_service',
            },
          },
        ]),
    ],
      controllers: [],
      providers: [RabbitMQService],
      exports: [RabbitMQService],
    })
    
export class RabbitModule {}
