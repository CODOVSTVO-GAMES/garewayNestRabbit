
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbit.servicve';
@Module({
    imports: [
        ClientsModule.register([
          {
            name: 'session-rabbit-mq-module',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://test:test@localhost:5672'],
              queue: 'rabbit-mq-nest-js',
            },
          },
        ]),
    ],
      controllers: [],
      providers: [RabbitMQService],
      exports: [RabbitMQService],
    })
    
export class RabbitModule {}
