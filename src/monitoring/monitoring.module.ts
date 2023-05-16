import { Global, Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { RabbitModule } from 'src/others/rabbit/rabbit.module';

@Global()
@Module({
  imports: [RabbitModule],
  providers: [MonitoringService],
  exports: [MonitoringService]  
})
export class MonitoringModule {}
