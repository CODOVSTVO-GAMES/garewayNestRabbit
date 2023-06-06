import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';

@Module({
  controllers: [MapController],
  providers: [MapService],
  imports: [RabbitModule],
})
export class MapModule { }
