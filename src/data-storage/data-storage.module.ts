import { Module } from '@nestjs/common';
import { DataStorageService } from './data-storage.service';
import { DataStorageController } from './data-storage.controller';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';

@Module({
  imports: [RabbitModule],
  providers: [DataStorageService],
  controllers: [DataStorageController]
})
export class DataStorageModule { }
