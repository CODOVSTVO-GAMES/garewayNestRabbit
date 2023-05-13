import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';
@Global()
@Module({
  imports: [RabbitModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule { }
