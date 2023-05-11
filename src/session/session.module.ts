import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { RabbitModule } from 'src/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
