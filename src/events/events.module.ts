import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
