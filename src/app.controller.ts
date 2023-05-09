import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitMQService } from './rabbit/rabbit.servicve';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Get()
  getHello(): string {
    this.rabbitMQService.send('rabbit-mq-producer', {
      message: this.appService.getHello(),
    });
    return 'Message sent to the queue!';
  }
}
