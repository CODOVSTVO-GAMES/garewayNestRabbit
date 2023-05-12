import { Module } from '@nestjs/common';
import { DataStorageService } from './data-storage.service';
import { DataStorageController } from './data-storage.controller';
import { RabbitModule } from 'src/rabbit/rabbit.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [RabbitModule, SessionModule],
  providers: [DataStorageService],
  controllers: [DataStorageController]
})
export class DataStorageModule {}
