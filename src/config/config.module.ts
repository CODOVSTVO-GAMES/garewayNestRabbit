import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  providers: [ConfigService],
  controllers: [ConfigController]
})
export class ConfigModule { }
