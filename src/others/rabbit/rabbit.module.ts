
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
        ClientsModule.register([
          {
            name: 'data-storage-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@rabbit:5672'],
              queue: 'to_data_storage_service',
            },
          },
        ]),
        ClientsModule.register([
          {
            name: 'events-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@rabbit:5672'],
              queue: 'to_events_service',
            },
          },
        ]),
        ClientsModule.register([
          {
            name: 'monitoring-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@rabbit:5672'],
              queue: 'to_monitoring_service',
            },
          },
        ]),
        ClientsModule.register([
          {
            name: 'user-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@rabbit:5672'],
              queue: 'to_user_service',
            },
          },
        ]),
        ClientsModule.register([
          {
            name: 'payments-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@rabbit:5672'],
              queue: 'to_payments_service',
            },
          },
        ]),
      ],
      controllers: [],
      providers: [RabbitMQService],
      exports: [RabbitMQService],
    })
    
export class RabbitModule {}
